import { test, expect, Page, FrameLocator } from '@playwright/test';
import { login } from './utils/loginHelper';

import {env} from './utils/env' 

const {
  PLAYWRIGHT_TEST_BASE_URL,
  PLAYWRIGHT_USERNAME,
  PLAYWRIGHT_PASSWORD,
  PLAYWRIGHT_DICTATION_UNIT_URL
} = env


test.describe('Exercise functionality',() => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(120_000);
    await login(page, {
      email: PLAYWRIGHT_USERNAME,
      password: PLAYWRIGHT_PASSWORD,
      remember: false,
    });
    await page.goto(PLAYWRIGHT_DICTATION_UNIT_URL);

    const dictationLink = page.locator('h4:has-text("Dictée")');
    await expect(dictationLink).toBeVisible({ timeout: 5000 });
    await dictationLink.click();
    
    await resetDictationIfFinished(page);
  });

  test('should play, pause, and replay audio, displaying correct icons', async ({ page }) => {

    const dictationFrame = await getDictationFrame(page);

    const mainControls = dictationFrame.locator('.main-controls');

    await expect(
      mainControls.locator('svg[viewBox="0 0 448 512"]')
    ).toBeVisible({ timeout: 10_000 });

    await mainControls.locator('.control-btn').click();
    await page.waitForTimeout(1_000);

    const isPlaying = await dictationFrame
      .locator('audio')
      .evaluate((el: HTMLAudioElement) => !el.paused && el.currentTime > 0);
    expect(isPlaying).toBe(true);

    await mainControls.locator('.control-btn').click();
    await page.waitForTimeout(300);

    const isPaused = await dictationFrame
      .locator('audio')
      .evaluate((el: HTMLAudioElement) => el.paused);
    expect(isPaused).toBe(true);

    await mainControls.locator('.control-btn').click();
    await dictationFrame
      .locator('audio')
      .evaluate((el: HTMLAudioElement) => { el.currentTime = el.duration; });
    await page.waitForTimeout(500);

    await expect(
      mainControls.locator('svg[viewBox="0 0 512 512"]')
    ).toBeVisible();
  });

  test('allows the user to adjust the audio volume to 50%, mute, and 100%', async ({ page }) => {

    const dictationFrame = await getDictationFrame(page);
    const muteButton = dictationFrame.locator('.unmute-button');
    const volumeSlider = dictationFrame.locator('.volume-slider');
    const audioElem = dictationFrame.locator('audio');

    await volumeSlider.fill('0.5');
    const vol50 = await audioElem.evaluate((el: HTMLAudioElement) => el.volume);
    expect(vol50).toBe(0.5);

    await muteButton.click();
    const volMuted = await audioElem.evaluate((el: HTMLAudioElement) => el.volume);
    expect(volMuted).toBe(0);

    await volumeSlider.fill('1'); 
    const volMax = await audioElem.evaluate((el: HTMLAudioElement) => el.volume);
    expect(volMax).toBe(1);
  });

  test('should allows the user to fill in and submit their response', async ({ page }) => {

    const dictationFrame = await getDictationFrame(page);

    const inputField        = dictationFrame.locator('.sound-section .input-wrapper input[type="text"]');
    const verifyButton      = dictationFrame.locator('form button[type="submit"]');
    const progressContainer = dictationFrame.locator('.progress-container');

    await inputField.fill('Lorem ipsum dolor sit amet');

    await expect(verifyButton).toBeEnabled();

    await verifyButton.click();

    await expect(progressContainer).toBeVisible();
  });

  test('should displays full feedback after retrying with the correct answer', async ({ page }) => {
    const frame = await getDictationFrame(page);

    const suggestion = await discoverCorrectAnswer(frame);

    await submitAnswer(frame, suggestion);

    await verifyFullFeedback(frame, suggestion);
  });

  test('should displays mixed feedback for a partially incorrect answer', async ({ page }) => {
    const frame = await getDictationFrame(page);

    const correctSentence = await discoverCorrectAnswer(frame);
    const correctWords = correctSentence.split(/\s+/);

    const mixedAnswer = correctWords.map((w, i) => i % 2 === 0 ? w : 'foobar').join(' ');

    await submitAnswer(frame, mixedAnswer);

    await verifyMixedFeedback(frame, correctWords);
  });

  
  test('should allows the user to skip to the next sentence via Next button', async ({ page }) => {
    const frame = await getDictationFrame(page);

    const firstSuggestion = await discoverCorrectAnswer(frame);

    const nextBtn = frame.locator('.activity-main .next button');
    await nextBtn.click();

    const secondSuggestion = await discoverCorrectAnswer(frame);

    expect(secondSuggestion).not.toEqual(firstSuggestion);
  });

  test('should allows the user to retry a sentence and clears the input on retry', async ({ page }) => {
    const frame = await getDictationFrame(page);
    const input = frame.locator('.sound-section .input-wrapper input[type="text"]');
    const verifyBtn = frame.locator('form button[type="submit"]');
    const retryBtn = frame.locator('button.retry-btn');

    await input.fill('wrong-answer');
    await verifyBtn.click();
    await expect(frame.locator('.feedback-section')).toBeVisible();

    await retryBtn.click();
    await expect(input).toBeEmpty();
  });

  test('should presents a final summary with the user\'s performance', async ({ page }) => {
    test.setTimeout(180_000)
    await completeAllDictationSentences(page);
    const frame = await getDictationFrame(page);
  
    const resultsContainer = frame.locator('#container-results');
    await expect(resultsContainer).toBeVisible({ timeout: 15000 });
  
    const totalScore = resultsContainer.locator('.total-score');
    await expect(totalScore).toBeVisible();
  });

  test('Offers the option to restart the test from the beginning after completing the exercise', async ({ page }) => {
    await completeAllDictationSentences(page);
    const frame = await getDictationFrame(page);

    const resultsContainer = frame.locator('#container-results');
    const retryAllBtn = resultsContainer.locator('div.buttons-wrapper > button:first-child');
    await expect(retryAllBtn).toBeVisible({ timeout: 10000 });
    await retryAllBtn.click();

    const input = frame.locator('.sound-section .input-wrapper input[type="text"]');
    await expect(input).toBeVisible({timeout: 10000});
  });

  test('Offers the option to jump to a specific sentence after completing the exercise', async ({ page }) => {
    await completeAllDictationSentences(page);
    const frame = await getDictationFrame(page);

    const firstRow = frame.locator('table.score-table tr:nth-of-type(1)')
    const retryBtn = firstRow.locator('button');
    await expect(retryBtn).toBeVisible();
    
    await retryBtn.click();

    const input = frame.locator('.sound-section .input-wrapper input[type="text"]');
    await expect(input).toBeVisible({ timeout: 15000 });
    await expect(input).toBeEmpty();
  });

  test('Displays a progress bar from the beginning to the end of the exercise', async ({ page }) => {
    const frame = await getDictationFrame(page);
    const progressBar = page.locator(
      '.modal.activity-modal.is-active .modal-card-actions .progress-container #progress-bar > div'
    );
    const totalSentences = await page
      .locator(
        '#unit-activities-wrapper  #gen-reusable-unit-activities .activities > ul > li'
      )
      .count();
  
    let previousPercent = 0;
    let percent;
  
    do {
      const style = await progressBar.getAttribute('style');
      const match = /width:\s*([\d.]+)(?:px|%)/.exec(style || '');
      expect(match, 'Progress style should include width percentage').toBeTruthy();
      percent = parseFloat(match![1]);
      await page.waitForTimeout(1500);
  
      // Check for regression
      if (percent < previousPercent) {
        throw new Error(
          `Progress regressed from ${previousPercent}% to ${percent}%`
        );
      }
  
      expect(
        percent,
        `Progress percent should not regress`
      ).toBeGreaterThanOrEqual(previousPercent);
      expect(percent).toBeLessThanOrEqual(100);
  
      previousPercent = percent;
  
      if (percent < 100) {
        const input = frame.locator(
          '.sound-section .input-wrapper input[type="text"]'
        );
        const verifyBtn = frame.locator('form button[type="submit"]');
        await input.fill('wrong-answer');
        await verifyBtn.click();
  
        const nextBtn = frame.locator('.activity-main .next button');
        await expect(nextBtn).toBeVisible({ timeout: 10000 });
        await nextBtn.click();
        await page.waitForTimeout(500);
      }
    } while (percent < 100);
  
    // Final progress should reach 100%
    const finalBar = page.locator(
      '.modal.activity-modal.is-active .modal-card-actions .progress-container #progress-bar div.has-padding'
    );
    const finalStyle = await finalBar.getAttribute('style');
    const finalMatch = /width:\s*100(?:\.0+)?%/.exec(finalStyle || '');
    expect(finalMatch, 'Final progress should show 100%').toBeTruthy();
  });

  test('Allows exiting the exercise during progress, returning to the course screen', async ({ page }) => {
    // Wait for the dictation modal to become active
    await page.waitForSelector('.modal.activity-modal.is-active', { timeout: 10000 });

    // Locate the close button in the header of the modal
    const closeButton = page.locator('.modal.activity-modal.is-active button.close-modal[aria-label="close"]');
    await expect(closeButton).toBeVisible({ timeout: 10000 });

    // Click the close button to exit
    await closeButton.click();

    // Verify that the course screen with chapters is displayed
    await page.waitForSelector('.unit-bar', { timeout: 10000 });
    const chaptersContainer = page.locator('.unit-bar');
    await expect(chaptersContainer).toBeVisible();
  });
  test('Allows exiting the exercise upon completion, returning to the course screen', async ({ page }) => {
    await completeAllDictationSentences(page);
    const frame = await getDictationFrame(page);

    const resultsContainer = frame.locator('#container-results');
    const exitExerciseBtn = resultsContainer.locator('div.buttons-wrapper > button').nth(1);
    await expect(exitExerciseBtn).toBeVisible({ timeout: 10000 });
    await exitExerciseBtn.click();

    // Verify that the course screen with chapters is displayed
    await page.waitForSelector('.unit-bar', { timeout: 10000 });
    const chaptersContainer = page.locator('.unit-bar');
    await expect(chaptersContainer).toBeVisible();
  });
});

async function getDictationFrame(page: Page): Promise<FrameLocator> {
  const selector = '.modal.activity-modal.is-active section.modal-card-body iframe[src]';
  await expect(page.locator(selector)).toBeVisible({ timeout: 10000 });
  return page.frameLocator(selector);
}
async function resetDictationIfFinished(page: Page) {
  const frame = await getDictationFrame(page);
  const resultsContainer = frame.locator('#container-results');
  await resultsContainer.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
  if (await resultsContainer.isVisible()) {
    const retryAllBtn = resultsContainer.locator('div.buttons-wrapper > button:first-child');
    await expect(retryAllBtn).toBeVisible();
    await retryAllBtn.click();
    await page.waitForTimeout(10_000);
  }
}

async function completeAllDictationSentences(page: Page) {
  while (true) {
    let frame: FrameLocator = await getDictationFrame(page);
    const input = frame.locator('.sound-section .input-wrapper input[type="text"]');

    const resultsContainer = frame.locator('#container-results');
    try {
      await resultsContainer.waitFor({ state: 'visible', timeout: 1500 });
      if (await resultsContainer.isVisible().catch(() => false)) {
        break;
      }
    } catch {
    }

    await input.fill('wrong-answer');

    const verifyBtn = frame.locator('form button[type="submit"]');
    await verifyBtn.click();

    const nextBtn = frame.locator('.activity-main .next button');
    await nextBtn.click();
    
    await page.waitForSelector(
      '.modal.activity-modal.is-active section.modal-card-body iframe[src]',
      { timeout: 10_000 }
    );
  }
}
async function discoverCorrectAnswer(
  frame: FrameLocator
): Promise<string> {
  const input = frame.locator(
    '.sound-section .input-wrapper input[type="text"]'
  );
  const verifyBtn = frame.locator('form button[type="submit"]');
  const feedbackSection = frame.locator('.feedback-section');

  await input.fill('wrong-answer');
  await verifyBtn.click();
  await expect(feedbackSection).toBeVisible();

  const rawParts = await frame
    .locator('.evaluation-bullet.miss .bullet span:not(.minus-point)')
    .allTextContents();
  const parts = rawParts
    .map(text => text.replace(/^.*\s/, '').trim())
    .filter(Boolean);

  return parts.join(' ');
}

async function submitAnswer(
  frame: FrameLocator,
  answer: string
) {
  const input = frame.locator(
    '.sound-section .input-wrapper input[type="text"]'
  );
  const retryBtn = frame.locator('button.retry-btn');
  const verifyBtn = frame.locator('form button[type="submit"]');

  await retryBtn.click();
  await expect(input).toBeEmpty();
  await input.fill(answer);
  await verifyBtn.click();
}

async function verifyFullFeedback(
  frame: FrameLocator,
  sentence: string
) {
  const words = sentence.split(/\s+/);
  const bullets = frame.locator('.evaluation-bullet.hit .bullet');
  await expect(bullets).toHaveCount(words.length);
  for (let i = 0; i < words.length; i++) {
    await expect(bullets.nth(i)).toHaveText(words[i]);
  }

  const score = frame.locator('.progress-container .score');
  await expect(score).toHaveText(`${words.length}/${words.length}`);
}

async function verifyMixedFeedback(frame: FrameLocator, correctWords: string[]) {
  const hitBullets = frame.locator('.evaluation-bullet.hit .bullet');
  const missBullets = frame.locator('.evaluation-bullet.miss .bullet');

  const expectedHits = Math.ceil(correctWords.length / 2);
  const expectedMisses = Math.floor(correctWords.length / 2);
  await expect(hitBullets).toHaveCount(expectedHits);
  await expect(missBullets).toHaveCount(expectedMisses);

  let hitIndex = 0;
  for (let i = 0; i < correctWords.length; i++) {
    if (i % 2 === 0) {
      await expect(hitBullets.nth(hitIndex)).toHaveText(correctWords[i]);
      hitIndex++;
    }
  }

  const score = frame.locator('.progress-container .score');
  await expect(score).toHaveText(`${expectedHits}/${correctWords.length}`);
}
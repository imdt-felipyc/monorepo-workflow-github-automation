export default function compareAnswers(userAnswer, expectedAnswer) {
  const userWords = userAnswer.trim().split(/\s+/).filter(Boolean);
  const expectedTokens = parseExpectedTokens(expectedAnswer);

  const usedUserIndexes = new Set();
  const matchedPositionsMap = mapUserWordsToExpectedTokens(userWords, expectedTokens, usedUserIndexes);

  return buildComparisonResult(userWords, expectedTokens, matchedPositionsMap, usedUserIndexes);
}

// Preprocess the expected answer by merging tokens like "@@word" followed by "|variant"
function preprocessExpectedAnswer(rawText) {
  const rawTokens = rawText.trim().split(/\s+/);
  const combinedTokens = [];

  for (let i = 0; i < rawTokens.length; i++) {
    let currentToken = rawTokens[i];

    if (
      currentToken.startsWith('@@') &&
      i + 1 < rawTokens.length &&
      rawTokens[i + 1].startsWith('|')
    ) {
      currentToken += rawTokens[i + 1]; // Merge "@@word" + "|variant"
      i++; // Skip the next token since it's merged
    }

    combinedTokens.push(currentToken);
  }

  return combinedTokens;
}

// Convert raw tokens into a structured map: { expectedWord, validOptions }
function parseExpectedTokens(expectedAnswer) {
  const rawTokens = preprocessExpectedAnswer(expectedAnswer);

  return rawTokens.map((token) => {
    if (token.startsWith('@@')) {
      const options = token.slice(2).split('|');
      return { expectedWord: options[0], validOptions: options };
    }

    return { expectedWord: token, validOptions: null };
  });
}

// Match each user word to its most likely expected token position
function mapUserWordsToExpectedTokens(userWords, expectedTokens, usedUserIndexes) {
  const matchedMap = new Map();

  for (let userIndex = 0; userIndex < userWords.length; userIndex++) {
    const userWord = userWords[userIndex];
    const candidateExpectedIndexes = [];

    for (let expectedIndex = 0; expectedIndex < expectedTokens.length; expectedIndex++) {
      if (matchedMap.has(expectedIndex)) continue;

      const { expectedWord, validOptions } = expectedTokens[expectedIndex];
      const isMatch = validOptions
        ? validOptions.includes(userWord)
        : userWord === expectedWord;

      if (isMatch) {
        candidateExpectedIndexes.push(expectedIndex);
      }
    }

    if (candidateExpectedIndexes.length > 0) {
      // Choose the closest expected position based on index distance
      candidateExpectedIndexes.sort(
        (a, b) => Math.abs(a - userIndex) - Math.abs(b - userIndex)
      );

      const bestMatchIndex = candidateExpectedIndexes[0];
      matchedMap.set(bestMatchIndex, userWord);
      usedUserIndexes.add(userIndex);
    }
  }

  return matchedMap;
}

// Build the final comparison result aligning user input with expected tokens
function buildComparisonResult(userWords, expectedTokens, matchedMap, usedUserIndexes) {
  const result = [];
  let userIndex = 0;
  let expectedIndex = 0;

  while (expectedIndex < expectedTokens.length || userIndex < userWords.length) {
    const currentExpected = expectedTokens[expectedIndex] || {};
    const expectedWord = currentExpected.expectedWord || '';
    const validOptions = currentExpected.validOptions || null;

    if (expectedIndex < expectedTokens.length && matchedMap.has(expectedIndex)) {
      // Add incorrect user words before the correct one
      while (userIndex < userWords.length && !usedUserIndexes.has(userIndex)) {
        result.push({
          userWord: userWords[userIndex],
          expectedWord: '',
          correct: false,
          options: null,
        });
        usedUserIndexes.add(userIndex);
        userIndex++;
      }

      const matchedUserWord = matchedMap.get(expectedIndex);
      result.push({
        userWord: matchedUserWord,
        expectedWord,
        correct: true,
        options: validOptions,
      });

      while (
        userIndex < userWords.length &&
        userWords[userIndex] !== matchedUserWord
      ) {
        userIndex++;
      }

      userIndex++;
      expectedIndex++;
    } else if (expectedIndex < expectedTokens.length) {
      // Expected word was not matched
      if (userIndex < userWords.length && !usedUserIndexes.has(userIndex)) {
        result.push({
          userWord: userWords[userIndex],
          expectedWord,
          correct: false,
          options: validOptions,
        });
        usedUserIndexes.add(userIndex);
        userIndex++;
        expectedIndex++;
      } else {
        result.push({
          userWord: '',
          expectedWord,
          correct: false,
          options: validOptions,
        });
        expectedIndex++;
      }
    } else {
      // Extra user words at the end
      while (userIndex < userWords.length) {
        if (!usedUserIndexes.has(userIndex)) {
          result.push({
            userWord: userWords[userIndex],
            expectedWord: '',
            correct: false,
            options: null,
          });
          usedUserIndexes.add(userIndex);
        }
        userIndex++;
      }
    }
  }

  return result;
}

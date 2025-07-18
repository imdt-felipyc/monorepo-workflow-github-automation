# Automated Tests with Playwright

This directory contains the end-to-end automated test suite using [Playwright](https://playwright.dev/), developed in **TypeScript**.

## Requirements

- **Node.js**: v18.x or higher
- **npm**: v10.x or higher


## Installation

In the terminal, follow the steps below to install Playwright dependencies:

1. Go to the `playwright` folder:
   ```bash
   cd playwright
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

## Creating Test Files

- All test files must be created inside the `tests` folder within the `playwright` directory.
- The test file name **must match the pattern** `*.e2e-spec.ts` (for example: `home.e2e-spec.ts`).
- Example:
  ```
  playwright/test/example.e2e-spec.ts
  ```
- Only files matching this pattern will be executed by Playwright, as defined by the `testMatch` configuration:
  ```
  testMatch: '**/*.e2e-spec.ts',
  ```

## Available Scripts

> **Important:** All npm scripts below must be executed from within the `playwright` folder.

- **test**: Runs all automated tests with Playwright.
  ```bash
  npm run test
  ```

- **test:local**: Runs the tests using the local URL defined in the `BASE_URL` environment variable.
  ```bash
  npm run test:local
  ```

- **test:ui**: Runs the tests with Playwright's visual interface, useful for debugging and inspecting tests.
  ```bash
  npm run test:ui
  ```

- **test:debug-local**: Runs the tests locally with detailed Playwright logs for debugging.
  ```bash
  npm run test:debug-local
  ```

- **test:report**: Opens the report of previously executed tests in a web interface.
  ```bash
  npm run test:report
  ```

### Notes about BASE_URL

- The `BASE_URL` environment variable is set directly in the scripts section of `package.json`.
- In continuous integration (CI) environments, such as the GitHub Actions workflow, `BASE_URL` is set dynamically with the link generated in the pull request comment by the bot.
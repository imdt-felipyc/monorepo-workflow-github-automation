# Automated Tests with Playwright

This directory contains the end-to-end automated test suite using [Playwright](https://playwright.dev/), developed in **TypeScript**.

## Requirements

- **Node.js**: v18.x or higher
- **npm**: v10.x or higher
- **Docker**: version 28.3.0, build 38b7060

## How to run the project locally

### 1. Fork and Clone the Main Project

1. Fork the [ESSR-IT/website-essr](https://github.com/ESSR-IT/website-essr) project to your GitHub account.
2. Clone your fork to your machine:
   ```bash
   git clone https://github.com/<your-username>/website-essr.git
   ```
3. Navigate to the root of the cloned project and run:
   ```bash
   ./docker/run
   ```

---

### 2. Fork and Clone the GSDS Project

1. Fork the [ESSR-IT/website-gsds](https://github.com/ESSR-IT/website-gsds) project to your GitHub account.
2. Clone your fork to your machine:
   ```bash
   git clone https://github.com/<your-username>/website-gsds.git
   ```
3. Navigate to the root of the cloned project and run:
   ```bash
   ./docker/run development
   ```

---

### 3. Install Playwright Dependencies

Navigate to the `playwright` folder and install dependencies:
```bash
cd playwright && npm install
```

---

### 4. Environment Setup

Duplicate the `.env.test.example` file and rename it to `.env.test`:
```bash
cp playwright/.env.test.example playwright/.env.test
```

---

### 5. Install the Playwright Extension in VS Code

Install the **Playwright Test for VSCode** extension in your VS Code IDE.

---

### 6. Creating Tests

#### 6.1 Creating Tests the Easy Way

To make your Playwright experience easier, we recommend watching short videos that provide an overview of the tool and demonstrate how to create tests simply and visually, directly from VS Code.

- [Official documentation: Playwright in VS Code](https://playwright.dev/docs/getting-started-vscode)

With these resources, you will learn how to:
- Use Playwright inside VS Code with a visual interface
- Record and generate tests automatically, writing minimal code
- Debug and inspect your tests intuitively

---

## Important Information

### Test Files

- All test files must be created inside the `tests` folder within the `playwright` directory.
- Test file names **must follow the pattern** `*.e2e-spec.ts` (e.g., `home.e2e-spec.ts`).
- Example:
  ```
  playwright/test/example.e2e-spec.ts
  ```
- Only files matching this pattern will be executed by Playwright, as defined in the `testMatch` configuration:
  ```
  testMatch: '**/*.e2e-spec.ts',
  ```

### BASE_URL Environment Variable

- In continuous integration (CI) environments such as GitHub Actions workflows, the `BASE_URL` is dynamically set with the link generated in the pull request comment by the bot.

---

## Available Scripts

> **Important:** All npm scripts below must be run from the `playwright` folder.

- **test**: Runs all automated Playwright tests.
  ```bash
  npm run test
  ```

- **test:local**: Runs tests using the local URL defined in the `BASE_URL` environment variable.
  ```bash
  npm run test:local
  ```

- **test:ui**: Runs tests using the visual Playwright UI, useful for debugging and inspecting.
  ```bash
  npm run test:ui
  ```

- **test:debug-local**: Runs tests locally with detailed Playwright logs for debugging.
  ```bash
  npm run test:debug-local
  ```

- **test:report**: Opens a web interface with the report of previously executed tests.
  ```bash
  npm run test:report
  ```

# Automated Tests with Playwright

This directory contains the end-to-end automated test suite using [Playwright](https://playwright.dev/), developed in **TypeScript**.

## Requirements

- **Node.js**: v18.x or higher
- **npm**: v10.x or higher
- **Docker**: version 28.3.0, build 38b7060

## How to run the project locally

### 1. Fork and Clone the Schooldrive API

1. Fork the [ESSR-IT/essr-schooldrive](https://github.com/iMDT/essr-schooldrive) project to your GitHub account.
2. Clone your fork to your machine:
   ```bash
   git clone https://github.com/<your-username>/essr-schooldrive.git
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

> **Note:** The following installation command is intended for **Ubuntu** systems.  
> If you are using **Windows** or **macOS**, you do **not** need the `--with-deps` flag.

Then, install Playwright and its required browsers and dependencies:
```bash
npx playwright install --with-deps
```


---

### 4. Environment Setup

Duplicate the `.env.test.example` file and rename it to `.env.test`:
```bash
cp playwright/.env.test.example playwright/.env.test
```

---

### 5. Creating Tests

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

---

### 6. Different Ways to Run the Tests


#### Run tests in standard mode

```bash
npm run test
```

Runs all automated tests in the terminal using the default mode.

#### Open the visual interface to explore and run tests

```bash
npm run test:ui
```

Opens the interactive graphical interface of the Playwright Test Runner, allowing you to view and run tests individually.

#### Record interactive tests with Codegen

```bash
npm run test:live-record
```

Opens the Chromium browser in interactive mode to capture user actions and automatically generate test code.

---

## Important Information

### BASE_URL Environment Variable

- In continuous integration (CI) environments such as GitHub Actions workflows, the `BASE_URL` is dynamically set with the link generated in the pull request comment by the bot.


### Available Scripts

> **Important:** All npm scripts below must be run from the `playwright` folder.



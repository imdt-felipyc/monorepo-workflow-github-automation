# Automated Tests with Playwright

This directory contains the end-to-end automated test suite using **Playwright**, developed in **TypeScript**.

> **Important:**  
> The E2E tests will **only work** correctly in a staging or pre-production environment, with a URL similar to:  
> `https://pr9-sd-preprod.dev.etu.essr.ch/unit/Ortho_01-01#act-1333`  
>  
> Make sure the `PLAYWRIGHT_DICTATION_UNIT_URL` environment variable (in your `.env.test` file) points to a valid URL of this type, with an accessible dictation unit and activity for automated testing.


## How to run the project

1. **Install Playwright Dependencies**

   > **Note:** The following installation command is intended for **Ubuntu** systems.  
   > If you are using **Windows** or **macOS**, you do **not** need the `--with-deps` flag.

   ```bash
   npx playwright install --with-deps
   ```

2. **Environment Setup**

   Duplicate the `.env.test.example` file and rename it to `.env.test`:

   ```bash
   cp .env.test.example .env.test
   ```

3. **Creating Tests**

   - All test files must be created inside the `tests` folder.
   - Test file names must follow the pattern `*.spec.ts` (e.g., `home.spec.ts`).

   Example:

   ```bash
   tests/example.spec.ts
   ```

4. **Different Ways to Run the Tests**

   - **Run tests in standard mode:**

     ```bash
     npm run test
     ```

     Runs all automated tests in the terminal using the default mode.

   - **Open the visual interface to explore and run tests:**

     ```bash
     npm run test:ui
     ```

     Opens the interactive graphical interface of the Playwright Test Runner, allowing you to view and run tests individually.

   - **Record interactive tests with Codegen:**

     ```bash
     npm run test:live-record
     ```

     Opens the Chromium browser in interactive mode to capture user actions and automatically generate test code.

5. **VSCode Extension for Playwright**

   To enhance your development experience, we recommend using **Visual Studio Code** with the Playwright extension:

   1. **Install VSCode**
      Download and install Visual Studio Code for your platform.

   2. **Add the Playwright Test Extension**
      - Open VSCode, go to the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`).
      - Search for **Playwright Test for VSCode** or install directly from the marketplace: https://playwright.dev/docs/getting-started-vscode

   ### Key Features

   - **Test Explorer:** Run and debug tests directly from the sidebar.
   - **Inline Code Lens:** Run individual tests or suites via clickable badges above your test definitions.
   - **Auto-completion & Snippets:** Get smart suggestions and boilerplate snippets for common Playwright APIs.
   - **Recording & Playback:** Quickly generate test code by recording interactions.

   Integrating this extension will streamline writing, running, and debugging your Playwright tests within VSCode.

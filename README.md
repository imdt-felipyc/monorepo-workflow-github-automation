# ESSR Dictation

Dictation module for the ESSR platform.


## Requirements

- **Node.js**: v18.x or higher
- **npm**: v10.x or higher


## Getting Started

1. **Fork the repository** [iMDT/essr-dictation](https://github.com/iMDT/essr-dictation) to your own account.
2. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/essr-dictation.git
   cd essr-dictation
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the development environment**:
   ```bash
   npm run dev
   ```


## Main Scripts

- `npm run dev` — Development environment with hot reload.
- `npm run build` — Generates the production build.
- `npm run test:e2e` — Runs E2E tests with Playwright.
- `npm run test:e2e:ui` — Opens the Playwright Test Runner visual interface.
- `npm run test:e2e:live-record` — Opens Playwright Codegen to record interactive tests.


## End-to-End Tests

Automated E2E tests use [Playwright](https://playwright.dev/) with TypeScript.

> For details on installation, environment setup, running, and troubleshooting tests, see:  
> 👉 [docs/e2e-test-readme.md](docs/e2e-test-readme.md)

> **Important:**  
> For tests to work correctly on GitHub Actions, you must add the following variables in  
> **GitHub** → **Settings** → **Secrets and variables** → **Actions**:
>
> - `PLAYWRIGHT_TEST_BASE_URL`
> - `PLAYWRIGHT_USERNAME`
> - `PLAYWRIGHT_PASSWORD`
> - `PLAYWRIGHT_DICTATION_UNIT_URL`
>
> These variables are used in GitHub Actions for the automated test workflow.
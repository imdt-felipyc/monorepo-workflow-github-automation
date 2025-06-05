# GitHub Projects Automation

This project uses serverless functions deployed on DigitalOcean to automate workflows within GitHub Projects.

---

## Table of Contents

- [Summary](#summary)
- [Supported Features](#supported-features)
    - [Features](#features)
    - [Limitations](#limitations)
    - [Important Notes](#important-notes)
- [Useful Resources](#useful-resources)
- [Prerequisites](#prerequisites)
- [Setting Up the GitHub App for Automation](#setting-up-the-github-app-for-automation)
- [Development with doctl](#development-with-doctl)
    - [Important Configurations for Proper Functionality](#important-configurations-for-proper-functionality)
    - [Deploy Code](#deploy-code)
    - [Invoke Function](#invoke-function)
    - [Observe Real-Time Logs](#observe-real-time-logs)
    - [Retrieve Activation Details](#retrieve-activation-details)
- [Real-Time Webhook Debugging](#real-time-webhook-debugging)
    - [🔧 Key Observations](#key-observations)
    - [🚀 How to Run the Project Locally](#how-to-run-the-project-locally)
    - [📦 Installing a Dev Dependency in a Workspace](#installing-a-dev-dependency-in-a-workspace)
- [Contributing](#contributing)
    - [How to Contribute](#how-to-contribute)
    - [Keeping Your Fork Updated](#keeping-your-fork-updated)

---

## Summary

This project automates workflows within GitHub Projects using serverless functions hosted on DigitalOcean.

---

## Supported Features

### Features

- [x] Automatically adds new items to the "Overview" project.
- [x] Inherits attributes from sibling items when added to a new project.
- [x] Ensures consistency by inheriting status, priority, and size when an item is added to multiple projects.
- [x] Includes a `dev-server` for local simulation of webhook calls.
- [x] Implements HMAC verification (`verifySignature`) to validate requests from GitHub.
- [x] Provides a `/webhook` endpoint compatible with GitHub `projects_v2_item` events.
- [x] Integrates Slack alerts via `SLACK_WEBHOOK_URL` for error reporting.
- [x] Offers a `/batch-sync-overview` endpoint for batch synchronization of issues.
- [x] Execution logs are paginated and stored in a DigitalOcean bucket (Spaces).
- [x] Choose projects to synchronize by adding the `[SYNC]` tag to their titles.

### Limitations
- Updates may be overwritten if triggered before the previous one completes.

---

## Useful Resources
- [DigitalOcean Functions Quickstart](https://docs.digitalocean.com/products/functions/getting-started/quickstart/)

---

## Prerequisites

- **Node.js**: v18.20.8 (confirm compatibility with loader)
- **npm**: v10.8.2
- **nvm**: v0.39.1
- **doctl digital ocean**: doctl version 1.127.0-release
- Environment variables must be defined either in a `.env` file at the root or via the DigitalOcean control panel.
    - The variable `GITHUB_APP_NAME` must include the `[bot]` prefix because the `sender` attribute sent by GitHub appends this automatically.
- For the synchronization to work, ensure that the title of the GitHub Project includes `[SYNC]`. This is required for the automation to identify and process the project correctly.
- To disable all workflows across all projects via the GitHub interface.


---

## Setting Up the GitHub App for Automation

To enable automation, configure a GitHub App within your organization by following these steps:

1. **Create and Install the GitHub App**:
    - Set up a GitHub App within your organization.
    - Choose to install it for all repositories.

2. **Generate HMAC Keys**:
    - Generate a private key to be used with HMAC for webhook signature validation.

3. **Create a Client Secret**:
    - Generate a client secret in the GitHub App settings to enable token generation for the GitHub API.

4. **Grant Required Permissions**:
    - Enable access to:
       - `Projects`
       - `Projects v2 item`
       - `Projects v2`
       - `Projects v2 status update`

---

## Development with doctl

### Important Configurations for Proper Functionality

- [DigitalOcean Functions Quickstart](https://docs.digitalocean.com/products/functions/getting-started/quickstart/)
- [How to Configure the DigitalOcean CLI (doctl)](https://docs.digitalocean.com/reference/doctl/how-to/install/)

### Deploy Code

```bash
doctl serverless deploy . --verbose
```

### Invoke Function

> `doctl serverless functions invoke` does not support headers

```bash
doctl serverless functions invoke github-sync/github-webhook -p debug:true --no-wait
```

### Observe Real-Time Logs

```bash
doctl serverless activations logs --follow --function github-sync/github-webhook
```

### Retrieve Activation Details

```bash
doctl serverless activations get <activation-id>
```

Replace `<activation-id>` with the actual activation ID.

---

## Real-Time Webhook Debugging

This project uses **npm workspaces**, so all commands should be executed from the **root** of the repository. The structure is designed to support a development workflow using a local server, ngrok tunnels, and GitHub webhooks.

### Key Observations

- The `dev-server` workspace is configured to support live debugging of GitHub webhooks.
- The `lib` folder at the root is required by DigitalOcean for bundling and deploying serverless functions.
- [`ngrok`](https://ngrok.com) is used during development to expose your local server publicly, allowing GitHub to deliver webhook events.
- Always run `npm install` from the **root** of the project. Never run it inside individual workspaces.

---

### How to Run the Project Locally

1. **Install all dependencies** from the root:
    ```bash
    npm install
    ```

2. **Create an account on ngrok** and obtain your authentication token.

3. **Start the tunnel**:
    ```bash
    npm run tunnel
    ```
4. **Update the GitHub App with the ngrok URL**:

    - Copy the URL generated by the `npm run tunnel` command (e.g., `https://<random-subdomain>.ngrok.io`).
    - Go to your GitHub App settings.
    - Update the **Webhook URL** field with the ngrok URL followed by the webhook endpoint (e.g., `https://<random-subdomain>.ngrok.io/webhook`).
    - Save the changes.

5. **Start dev-server**:
    ```bash
    npm run dev:watch
    ```
    > All commands above must be executed **from the root** 

---

### Installing a Dev Dependency in a Workspace

To install a development dependency for a specific workspace:

```bash
npm install <package-name> --save-dev --workspace=<workspace-name>
```

**Example**: Installing AWS-SDK in package

```bash
npm install aws-sdk  --workspace=packages/github-sync/gith
ub-webhook
```

This ensures modular dependency management across the monorepo.

---

## Contributing

### How to Contribute

1. **Fork the Repository** on GitHub.
2. **Clone your fork**:
    ```bash
    git clone https://github.com/<your-username>/essr-github-automations.git
    ```
3. **Create a new branch** for your changes:
    ```bash
    git checkout -b <branch-name>
    ```
4. **Make changes**:
    ```bash
    git add .
    git commit -m "Describe your changes"
    ```
5. **Push your changes**:
    ```bash
    git push origin <branch-name>
    ```
6. **Open a Pull Request** from your branch to the original repository.

### Keeping Your Fork Updated

1. Add the original repository as `upstream`:
    ```bash
    git remote add upstream https://github.com/<original-owner>/essr-github-automations.git
    ```

2. Fetch the latest changes:
    ```bash
    git fetch upstream
    ```

3. Merge into your local branch:
    ```bash
    git merge upstream/main
    ```

---

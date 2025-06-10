#!/bin/bash

# Replace with the path to your repository (e.g., imdt-felipyc/monorepo-workflow-github-automation)
REPO="imdt-felipyc/monorepo-workflow-github-automation"

# Deleting all existing secrets
echo "🗑️ Deleting secrets from the .env file..."
while IFS='=' read -r key _; do
  if [[ ! -z "$key" && ! "$key" =~ ^# ]]; then
    echo "❌ Removing $key"
    gh secret delete "$key" --repo "$REPO"
  fi
done < .env

# Adding new secrets
echo "🔐 Adding new secrets..."
while IFS='=' read -r key value; do
  if [[ ! -z "$key" && ! "$key" =~ ^# ]]; then
    echo "🔐 Adding $key"
    gh secret set "$key" --repo "$REPO" --body "$value"
  fi
done < .env

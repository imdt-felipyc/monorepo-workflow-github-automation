#!/bin/bash

# Replace with the path to your repository (e.g., imdt-felipyc/monorepo-workflow-github-automation)
REPO="imdt-felipyc/monorepo-workflow-github-automation"

# Deleting all existing variables
echo "🗑️ Deleting variables from the .env file..."
while IFS='=' read -r key _; do
  if [[ ! -z "$key" && ! "$key" =~ ^# ]]; then
    echo "❌ Removing $key"
    gh variable delete "$key" --repo "$REPO"
  fi
done < .env

# Adding new variables
echo "🔐 Adding new variables..."
while IFS='=' read -r key value; do
  if [[ ! -z "$key" && ! "$key" =~ ^# ]]; then
    echo "🔐 Adding $key"
    gh variable set "$key" --repo "$REPO" --body "$value"
  fi
done < .env

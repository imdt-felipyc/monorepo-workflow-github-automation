#!/bin/bash

REPO="imdt-felipyc/monorepo-workflow-github-automation"

while IFS='=' read -r key value; do
  if [[ ! -z "$key" && ! "$key" =~ ^# ]]; then
    echo "🔐 Add $key"
    gh secret set "$key" --repo "$REPO" --body "$value"
  fi
done < .env

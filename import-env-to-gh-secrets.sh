#!/bin/bash

REPO="imdt-felipyc/monorepo-workflow-github-automation"

while IFS='=' read -r key value || [ -n "$key" ]; do
  value="${value%\"}"
  value="${value#\"}"
  
  if [[ -n "$key" && ! "$key" =~ ^# ]]; then
    echo "🔐 Setting secret: $key"
    echo "$value" | gh secret set "$key" --repo "$REPO" --body -
  fi
done < .env

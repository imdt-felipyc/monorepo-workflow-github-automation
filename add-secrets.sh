#!/bin/bash

# Substitua pelo caminho do seu repositório (ex: imdt-felipyc/monorepo-workflow-github-automation)
REPO="imdt-felipyc/monorepo-workflow-github-automation"

while IFS='=' read -r key value; do
  if [[ ! -z "$key" && ! "$key" =~ ^# ]]; then
    echo "🔐 Adicionando $key"
    gh secret set "$key" --repo "$REPO" --body "$value"
  fi
done < .env

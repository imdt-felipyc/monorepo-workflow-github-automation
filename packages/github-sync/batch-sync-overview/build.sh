#!/bin/sh

# Este arquivo build.sh existe apenas para impedir que a DigitalOcean execute automaticamente "npm install --production"
# durante o processo de build remoto em Functions (https://docs.digitalocean.com/products/functions/reference/build-process/).
#
# Isso é necessário porque o package.json deste projeto inclui pacotes compartilhados (como "@repo/shared") que são internos
# e não estão publicados no npm, o que causaria falhas no build remoto.
#
# O build real (compilação, bundling, remoção de dependências locais, etc.) é feito por um GitHub Actions workflow.
#
# IMPORTANTE:
# Para que a DigitalOcean reconheça e execute corretamente esse arquivo (mesmo vazio),
# ele precisa estar com permissão de execução:
#
#   chmod +x build.sh
#
# Caso contrário, o deploy com `doctl serverless deploy` resultará em erro de permissão.

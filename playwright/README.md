# Testes Automatizados com Playwright

Este diretório contém a suíte de testes automatizados end-to-end utilizando o [Playwright](https://playwright.dev/), desenvolvida em **TypeScript**.

## Requisitos

- **Node.js**: v18.x ou superior
- **npm**: v10.x ou superior
- **Docker**: version 28.3.0, build 38b7060

## Como executar o projeto localmente

### 1. Fork e Clonagem do Projeto Principal

1. Faça um fork do projeto [ESSR-IT/website-essr](https://github.com/ESSR-IT/website-essr) para sua conta no GitHub.
2. Clone o fork para sua máquina:
   ```bash
   git clone https://github.com/<seu-usuario>/website-essr.git
   ```
3. Acesse a raiz do projeto clonado e execute:
   ```bash
   ./docker/run
   ```

---

### 2. Fork e Clonagem do Projeto GSDS

1. Faça um fork do projeto [ESSR-IT/website-gsds](https://github.com/ESSR-IT/website-gsds) para sua conta no GitHub.
2. Clone o fork para sua máquina:
   ```bash
   git clone https://github.com/<seu-usuario>/website-gsds.git
   ```
3. Acesse a raiz do projeto clonado e execute:
   ```bash
   ./docker/run development
   ```

---

### 3. Instale as Dependências do Playwright

Acesse a pasta `playwright` e instale as dependências:
```bash
cd playwright && npm install
```

---

### 4. Configuração de Ambiente

Duplique o arquivo `.env.test.example` e renomeie para `.env.test`:
```bash
cp playwright/.env.test.example playwright/.env.test
```

---

### 5. Instale a Extensão do Playwright no VS Code

Instale a extensão **Playwright Test for VSCode** na sua IDE VS Code.

---

### 6. Criando Testes

#### 6.1 Criando Testes de Forma Fácil

Para facilitar sua experiência com o Playwright, recomendamos assistir a vídeos curtos que oferecem um overview da ferramenta e mostram como criar testes de forma simples e visual, diretamente no VS Code.

- [Documentação oficial: Playwright no VS Code](https://playwright.dev/docs/getting-started-vscode)

Com esses recursos, você vai aprender a:
- Usar o Playwright dentro do VS Code de forma visual
- Gravar e gerar testes automaticamente, escrevendo pouco código
- Depurar e inspecionar seus testes de maneira intuitiva

---

## Informações Importantes

### Arquivos de Teste

- Todos os arquivos de teste devem ser criados dentro da pasta `tests` no diretório `playwright`.
- O nome do arquivo de teste **deve seguir o padrão** `*.e2e-spec.ts` (por exemplo: `home.e2e-spec.ts`).
- Exemplo:
  ```
  playwright/test/example.e2e-spec.ts
  ```
- Apenas arquivos que seguem esse padrão serão executados pelo Playwright, conforme definido na configuração `testMatch`:
  ```
  testMatch: '**/*.e2e-spec.ts',
  ```

### Variável de Ambiente BASE_URL

- Em ambientes de integração contínua (CI), como o workflow do GitHub Actions, a `BASE_URL` é definida dinamicamente com o link gerado no comentário do pull request pelo bot.

---

## Scripts Disponíveis

> **Importante:** Todos os scripts npm abaixo devem ser executados a partir da pasta `playwright`.

- **test**: Executa todos os testes automatizados com o Playwright.
  ```bash
  npm run test
  ```

- **test:local**: Executa os testes usando a URL local definida na variável de ambiente `BASE_URL`.
  ```bash
  npm run test:local
  ```

- **test:ui**: Executa os testes com a interface visual do Playwright, útil para depuração e inspeção dos testes.
  ```bash
  npm run test:ui
  ```

- **test:debug-local**: Executa os testes localmente com logs detalhados do Playwright para depuração.
  ```bash
  npm run test:debug-local
  ```

- **test:report**: Abre o relatório dos testes executados anteriormente em uma interface web.
  ```bash
  npm run test:report
  ```


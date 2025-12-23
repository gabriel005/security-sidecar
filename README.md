## 📋 Sobre o Projeto

O **Security Sidecar** é uma implementação de arquitetura **DevSecOps** que integra testes funcionais automatizados (Playwright) com análise de segurança dinâmica (DAST) usando o **OWASP ZAP**.

O objetivo é aplicar o conceito de **"Shift-Left Security"**: em vez de esperar um pentest manual no final do ciclo, a segurança é verificada automaticamente toda vez que a suíte de regressão roda.

### 🏗️ Como Funciona (Arquitetura Sidecar)

1.  **Container Docker (Sidecar):** O OWASP ZAP roda isolado em um container Docker, atuando como um Proxy Reverso.
2.  **Testes Funcionais:** O Playwright executa os testes de E2E navegando pela aplicação, mas todo o tráfego passa pelo Proxy do ZAP (`:8090`).
3.  **Passive Scan:** O ZAP analisa silenciosamente as requisições/respostas em busca de vulnerabilidades (ex: falta de headers de segurança, cookies inseguros, XSS refletido) sem a necessidade de scripts de ataque agressivos.
4.  **Relatório Automático:** Ao final, um relatório HTML detalhado é gerado.

---

## 🚀 Tecnologias Utilizadas

- **[Playwright](https://playwright.dev/):** Automação de testes E2E.
- **[OWASP ZAP (Zed Attack Proxy)](https://www.zaproxy.org/):** Scanner de vulnerabilidades web.
- **[Docker](https://www.docker.com/):** Orquestração do container de segurança.
- **Node.js & Axios:** Script controlador da pipeline.

---

## ⚙️ Pré-requisitos

Para rodar este projeto localmente, você precisa ter instalado:

- [Node.js](https://nodejs.org/) (LTS)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [VS Code](https://code.visualstudio.com/)

---

## 🛠️ Instalação

1.  Clone o repositório:

    ```bash
    git clone https://github.com/gabriel005/security-sidecar.git
    cd security-sidecar
    ```

2.  Instale as dependências do Node:

    ```bash
    npm install
    ```

3.  Instale os navegadores do Playwright:
    ```bash
    npx playwright install
    ```

---

## ▶️ Como Rodar

### 1. Suba o ambiente de Segurança (ZAP)

Inicie o container do ZAP em modo "daemon" (serviço):

```bash
docker-compose up -d
```

Para derrubar o container:

```bash
docker-compose down
```

Gerar relatório de teste Playwright:

```bash
npx playwright show-report
```

Rodar o projeto:

```bash
node run-security.js 
```

Gerar relatório de teste ZAP:

```bash
start security-report.html
```
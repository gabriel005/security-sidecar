// run-security.js
const { execSync } = require("child_process");
const ZapService = require("./lib/zap-service");
const config = require("./config/security.config");

// Configurações
const zap = new ZapService(config.zap.baseUrl);

async function runPipeline() {
  console.log("🚀 Iniciando Pipeline de Segurança (Sidecar Pattern)\n");

  // 1. Execução dos Testes Funcionais
  try {
    console.log("🔵 [1/3] Rodando Playwright...");
    execSync("npx playwright test", { stdio: "inherit" });
  } catch (e) {
    console.log("⚠️ Testes funcionais finalizaram. Seguindo...");
  }

  // 2. Espera passiva (Sidecar)
  console.log("\n🔵 [2/3] Sincronizando dados...");
  await zap.waitForPassiveScan(5000);

  // 3. Geração do Relatório
  console.log("\n🔵 [3/3] Gerando Artefatos...");
  await zap.generateHtmlReport("security-report.html");
}

runPipeline();

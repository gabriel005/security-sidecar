// lib/zap-service.js
const axios = require("axios");
const fs = require("fs");

class ZapService {
  constructor(apiUrl) {
    this.api = axios.create({ baseURL: apiUrl });
  }

  async waitForPassiveScan(durationMs = 5000) {
    console.log(`☕ Esperando ${durationMs / 1000}s para o ZAP processar...`);
    return new Promise((r) => setTimeout(r, durationMs));
  }

  async generateHtmlReport(outputPath = "security-report.html") {
    try {
      console.log("📄 Baixando Relatório de Segurança...");
      // proxy: false é crucial para scripts Node rodando fora do browser
      const response = await this.api.get("/OTHER/core/other/htmlreport/", {
        params: { apikey: "" },
        proxy: false,
      });

      fs.writeFileSync(outputPath, response.data);
      console.log(`🎉 Relatório salvo em: ${outputPath}`);
      return true;
    } catch (error) {
      console.error("❌ Erro ao gerar relatório:", error.message);
      return false;
    }
  }

  async generateJsonReport(outputPath = "security-report.json") {
    try {
      console.log("📊 Baixando Relatório de Dados (JSON)...");
      
      // Muda o endpoint para /jsonreport/
      const response = await this.api.get("/OTHER/core/other/jsonreport/", {
        params: { apikey: "" },
        proxy: false,
      });

      // O Axios já converte a resposta para Objeto JS.
      // Precisamos transformar em texto de novo para salvar no arquivo.
      // O 'null, 2' serve para deixar o JSON bonitinho (indentado).
      fs.writeFileSync(outputPath, JSON.stringify(response.data, null, 2));
      
      console.log(`✅ Relatório JSON salvo em: ${outputPath}`);
      return true;
    } catch (error) {
      console.error("❌ Erro ao gerar relatório JSON:", error.message);
      return false;
    }
  }
}

module.exports = ZapService;

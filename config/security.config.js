// config/security.config.js

module.exports = {
  zap: {
    // Se mudar a porta no Docker, mudar só aqui
    baseUrl: "http://127.0.0.1:8090",
    apiKey: "", // Preparado para caso você habilite autenticação no futuro
  },
  report: {
    // Nome padrão do relatório
    filename: "security-report.html",
    // Tempo de espera para o ZAP processar (em ms)
    passiveScanDelay: 5000,
  },
};

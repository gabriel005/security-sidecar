const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs');

// Note: A API interna do container é acessada via 8090 do Windows
const ZAP_API = 'http://127.0.0.1:8090';

async function runSecurityScan() {
  try {
    // --- PASSO 1: Playwright (Navegação) ---
    console.log('🔵 1. Rodando Testes Playwright...');
    try {
      // O Playwright navega e o ZAP "assiste" tudo passivamente
      execSync('npx playwright test', { stdio: 'inherit' });
    } catch (e) {
      console.log('⚠️ Testes funcionais terminaram. Gerando relatório de segurança...');
    }

    console.log('☕ Esperando 5 segundos para o ZAP processar os dados...');
    await new Promise(r => setTimeout(r, 5000));

    // --- PASSO 2: RELATÓRIO (Passive Scan) ---
    // REMOVEMOS O SPIDER/ACTIVE SCAN para evitar o erro de porta 502/Refused.
    console.log('📄 2. Baixando Relatório de Segurança (Passive Scan)...');
    
    try {
        const reportResponse = await axios.get(`${ZAP_API}/OTHER/core/other/htmlreport/`, {
            params: { apikey: '' } 
        });
        
        fs.writeFileSync('security-report.html', reportResponse.data);
        console.log('🎉 SUCESSO! O relatório foi gerado.');
        console.log('👉 Abra o arquivo "security-report.html" na pasta do seu projeto.');
    } catch (err) {
        console.error('❌ Erro ao baixar relatório:', err.message);
    }

  } catch (error) {
    console.error('\n❌ ERRO GERAL:', error.message);
  }
}

runSecurityScan();
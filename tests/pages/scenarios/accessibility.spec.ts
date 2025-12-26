// tests/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import { JuiceShopPage } from '../juice-shop.page'; 
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

test.describe('♿ Acessibilidade (A11y)', () => {
    // Variável para acumular erros de TODAS as páginas
    let allViolations: any[] = [];

    test('Deve validar regras de acessibilidade na Home', async ({ page }) => {
        const juice = new JuiceShopPage(page);
        await juice.goto();
        await juice.handleOverlays();

        const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        // Adiciona os erros da Home na lista geral
        // Mapeamos para adicionar uma tag indicando a origem (Opcional, mas ajuda)
        const violationsWithContext = results.violations.map(v => ({
            ...v,
            help: `[HOME] ${v.help}` // Prefixo para saber que veio da Home
        }));
        
        allViolations.push(...violationsWithContext);
        console.log(`🔎 Home escaneada: ${violationsWithContext.length} violações encontradas.`);
    });

    test('Deve validar regras de acessibilidade no Login', async ({ page }) => {
        const juice = new JuiceShopPage(page);
        await juice.goto();
        await juice.handleOverlays();
        
        await juice.navigateToLogin();
        await expect(juice.emailInput).toBeVisible();

        const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze();

        // Adiciona os erros do Login na lista geral
        const violationsWithContext = results.violations.map(v => ({
            ...v,
            help: `[LOGIN] ${v.help}` // Prefixo para saber que veio do Login
        }));

        allViolations.push(...violationsWithContext);
        console.log(`🔎 Login escaneado: ${violationsWithContext.length} violações encontradas.`);
    });

    // Roda UMA VEZ ao final de todos os testes desse grupo
    test.afterAll(async () => {
        // Monta o objeto final que o React espera
        const finalReport = {
            violations: allViolations,
            timestamp: new Date().toISOString()
        };

        // Salva na pasta do Dashboard
        const publicDir = path.join(process.cwd(), 'dashboard', 'public');
        const filePath = path.join(publicDir, 'accessibility-report.json');

        console.log(`📂 Tentando salvar em: ${filePath}`);

        try {
            // Garante que a pasta existe antes de gravar
            if (!fs.existsSync(publicDir)){
                console.log('mkdir: Criando pasta dashboard/public...');
                fs.mkdirSync(publicDir, { recursive: true });
            }

            fs.writeFileSync(filePath, JSON.stringify(finalReport, null, 2));
            console.log(`✅ SUCESSO! Relatório salvo.`);
        } catch (error) {
            console.error('❌ ERRO AO GRAVAR ARQUIVO:', error);
        }
    });
});
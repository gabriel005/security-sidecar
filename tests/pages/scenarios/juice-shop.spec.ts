import { test, expect } from "@playwright/test";
import { JuiceShopPage } from "../juice-shop.page";

test.describe("OWASP Juice Shop - Security Scenarios", () => {
  // Variáveis do teste
  const EMAIL_TESTE = `qa-${Date.now()}@teste.com`; // Gera um email único por execução
  const SENHA_TESTE = "teste123teste!";

  test('Cenário 1: Login Inválido (Gera alertas no ZAP)', async ({ page }) => {
    const juice = new JuiceShopPage(page);

    //******** DADO ********
    // O 'test.step' cria o bloco visual no relatório
    await test.step("DADO que acesso a loja, limpo os banners e acesso a tela de login", async () => {
      await juice.goto(); // acessar a loja
      await juice.handleOverlays(); // limpar os banners chatos
      await juice.navigateToLogin();
    });

    //******** QUANDO ********
    await test.step("QUANDO tento logar com usuário inexistente", async () => {
      await juice.login("hacker@teste.com", "senhaErrada123");
    });

    //******** ENTÃO ********
    await test.step("ENTÃO vejo a mensagem de erro de segurança", async () => {
      await expect(page.getByText("Invalid email or password")).toBeVisible();
    });
  });

  test("Cenário 2: Criar e Logar com Sucesso", async ({ page }) => {
    const juice = new JuiceShopPage(page);
    
    //******** DADO ********
    await test.step("DADO que acesso a loja, limpo os banners e acesso a tela de login", async () => {
      await juice.goto(); // acessar a loja
      await juice.handleOverlays(); // limpar os banners chatos
      await juice.navigateToLogin();
    });

    //******** QUANDO ********
    await test.step("QUANDO crio uma conta", async () => {
      await juice.registerUser(EMAIL_TESTE, SENHA_TESTE);
    });

    await test.step("E faço login com as credenciais corretas", async () => {
      await juice.login(EMAIL_TESTE, SENHA_TESTE);
    });

    //******** ENTÃO ********
    await test.step("ENTÃO devo ver o botão de carrinho (prova que logou)", async () => {
      await expect(
        page.locator('button[aria-label="Show the shopping cart"]')
      ).toBeVisible();
    });
  });
});

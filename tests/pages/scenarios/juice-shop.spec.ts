import { test, expect } from "@playwright/test";
import { JuiceShopPage } from "../juice-shop.page";

test.describe("OWASP Juice Shop - Security Scenarios", () => {
  test("Deve tentar logar com credenciais inválidas e gerar tráfego para o ZAP", async ({
    page,
  }) => {
    const juice = new JuiceShopPage(page);

    //******** DADO ********
    // O 'test.step' cria o bloco visual no relatório
    await test.step("DADO que acesso a loja e limpo os banners", async () => {
      await juice.goto(); // acessar a loja
      await juice.handleOverlays(); // limpar os banners chatos
    });

    //******** QUANDO ********
    await test.step("QUANDO navego para a tela de login", async () => {
      await juice.navigateToLogin();
    });

    await test.step("E tento logar com usuário inexistente", async () => {
      // O ZAP vai capturar este momento exato
      await juice.login("hacker@teste.com", "senhaErrada123");
    });


    //******** ENTÃO ********
    await test.step("ENTÃO vejo a mensagem de erro de segurança", async () => {
      await expect(page.getByText("Invalid email or password")).toBeVisible();
    });


  });
});

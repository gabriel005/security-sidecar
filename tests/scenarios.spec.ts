import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/home.page";

test.describe("Funcionalidades da Home Page", () => {
  test("Deve conseguir acessar o Get Started", async ({ page }) => {
    // 1. Arrange (Preparar)
    const home = new HomePage(page);
    await home.goto();

    // 2. Act (Agir)
    await home.clickGetStarted();

    // 3. Assert (Validar)
    // Verifica se a URL mudou para /docs/intro
    await expect(page).toHaveURL(/.*intro/);
  });


  test('Deve realizar uma busca por "Locators"', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // Realiza a busca
    await home.searchFor("Locators");

    // Valida se apareceu algo relacionado a Locators na tela
    await expect(
      home.searchResults.filter({ hasText: 'Locators' }).first()
    ).toBeVisible();
  });
});

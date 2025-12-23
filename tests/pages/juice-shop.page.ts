import { type Locator, type Page } from "@playwright/test";

export class JuiceShopPage {
  readonly page: Page;
  readonly dismissButton: Locator;
  readonly cookieButton: Locator;
  readonly accountButton: Locator;
  readonly loginButton: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorToast: Locator;

  constructor(page: Page) {
    this.page = page;

    // Mapeamento dos Elementos (Selectors)
    // O Juice Shop usa IDs e classes bem definidos, mas às vezes aria-labels
    this.dismissButton = page.locator(
      'button[aria-label="Close Welcome Banner"]'
    );
    this.cookieButton = page.locator('a[aria-label="dismiss cookie message"]');

    this.accountButton = page.locator("#navbarAccount");
    this.loginButton = page.locator("#navbarLoginButton");

    this.emailInput = page.locator("#email");
    this.passwordInput = page.locator("#password");
    this.submitButton = page.locator("#loginButton");

    // Mensagem de erro que aparece se errar a senha
    this.errorToast = page.locator(".error");
  }

  async goto() {
    await this.page.goto("http://juiceshop:3000/");
  }

  // Função para limpar a frente da tela (fechar popups)
  async handleOverlays() {
    // O banner nem sempre aparece instantaneamente, ou pode já ter sumido
    if (await this.dismissButton.isVisible()) {
      await this.dismissButton.click();
    }
    if (await this.cookieButton.isVisible()) {
      await this.cookieButton.click();
    }
  }

  async navigateToLogin() {
    await this.accountButton.click();
    await this.loginButton.click();
  }

  async login(user: string, pass: string) {
    await this.emailInput.fill(user);
    await this.passwordInput.fill(pass);
    await this.submitButton.click();
  }
}

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

  readonly newUserLink: Locator;
  readonly registerEmail: Locator;
  readonly registerPassword: Locator;
  readonly registerRepeatPassword: Locator;
  readonly securityQuestionDropdown: Locator;
  readonly securityQuestionAnswer: Locator;
  readonly registerButton: Locator;

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

    // Locators de Cadastro
    this.newUserLink = page.locator('a[href="#/register"]');
    this.registerEmail = page.locator("#emailControl");
    this.registerPassword = page.locator("#passwordControl");
    this.registerRepeatPassword = page.locator("#repeatPasswordControl");

    // O Dropdown do Material UI
    this.securityQuestionDropdown = page.locator('mat-select[name="securityQuestion"]');
    this.securityQuestionAnswer = page.locator("#securityAnswerControl");
    this.registerButton = page.locator("#registerButton");
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

  async registerUser(email: string, pass: string) {
    // Clica no link "Not yet a customer?" na tela de login
    await this.newUserLink.click();

    await this.registerEmail.fill(email);
    await this.registerPassword.fill(pass);
    await this.registerRepeatPassword.fill(pass);

    // Hack para o Dropdown chato: Clica, espera aparecer a opção e clica na primeira
    await this.securityQuestionDropdown.click();
    await this.page.locator("mat-option").first().click();

    await this.securityQuestionAnswer.fill("QA");
    await this.registerButton.click();

    // Espera voltar para o login automaticamente ou valida snackbar
    await this.page.waitForURL("**/login");
  }
}

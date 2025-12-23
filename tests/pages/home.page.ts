import { type Locator, type Page } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly getStartedLink: Locator;
  readonly searchButton: Locator;
  readonly searchInput: Locator;
  readonly searchResults: Locator;

  constructor(page: Page) {
    this.page = page;
    this.getStartedLink = page.getByRole("link", { name: "Get started" });
    this.searchButton = page.getByLabel("Search");
    this.searchInput = page.locator("#docsearch-input");
    this.searchResults = page.locator(".DocSearch-Hit-title");
  }

  async goto() {
    await this.page.goto("https://playwright.dev");
  }

  async clickGetStarted() {
    await this.getStartedLink.click();
  }

  async searchFor(term: string) {
    await this.searchButton.click();
    await this.searchInput.fill(term);
  }
}

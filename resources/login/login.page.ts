import { expect, Page } from '@playwright/test';
import { LoginPageLocators } from './login.locators';

export class LoginPage {
  public readonly locators: LoginPageLocators;

  constructor(protected page: Page) {
    this.locators = new LoginPageLocators(page);
  }

  public async navigateToLoginPage(): Promise<void> {
    await this.page.goto('/');
  }

  public async expectLoginPageRendered(): Promise<void> {
    await expect(this.page).toHaveURL(/\/$/);
    await expect(this.locators.emailInput).toBeVisible();
    await expect(this.locators.passwordInput).toBeVisible();
    await expect(this.locators.loginButton).toBeVisible();
  }

  public async fillUsername(username: string): Promise<void> {
    await this.locators.emailInput.fill(username);
  }

  public async fillPassword(password: string): Promise<void> {
    await this.locators.passwordInput.fill(password);
  }

  public async submitLogin(): Promise<void> {
    await this.locators.loginButton.click();
  }

  public async submitLoginWithEnter(): Promise<void> {
    await this.locators.passwordInput.press('Enter');
  }

  public async login(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.submitLogin();
  }

  public async navigateBack(): Promise<void> {
    await this.page.goBack();
  }

  public async expectPasswordFieldMasked(): Promise<void> {
    await expect(this.locators.passwordInput).toHaveAttribute('type', 'password');
  }

  public async expectErrorMessageVisible(): Promise<void> {
    await expect(this.locators.errorMessage).toBeVisible();
  }

  public async expectErrorMessageNotVisible(): Promise<void> {
    await expect(this.locators.errorMessage).not.toBeVisible();
  }

  public async expectErrorMessageText(expectedText: string): Promise<void> {
    await expect(this.locators.errorMessage).toHaveText(expectedText);
  }

  public async dismissErrorMessage(): Promise<void> {
    await this.locators.dismissErrorButton.click();
  }

  public async expectLoginSlowerThan(username: string, password: string,minMs: number): Promise<void> {
    const start = Date.now();
    await this.login(username, password);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThan(minMs);
  }

  public async expectNoSessionCookie(): Promise<void> {
    await expect
      .poll(async () => {
        const cookies = await this.page.context().cookies();
        return cookies.find((cookie) => cookie.name === 'session-username');
      })
      .toBeUndefined();
  }
}
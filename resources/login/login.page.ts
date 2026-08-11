import { expect, Locator, Page } from '@playwright/test';
import { LoginPageLocators } from './login.locators';

export class LoginPage {
  public readonly locators: LoginPageLocators;

  constructor(protected page: Page) {
    this.locators = new LoginPageLocators(page);
  }

  public async navigateToLoginPage(): Promise<void> {
    await this.page.goto('/');
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

}
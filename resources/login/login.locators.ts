import { Page, Locator } from '@playwright/test';

export class LoginPageLocators {
  constructor(private page: Page) {}

  get emailInput(): Locator {
    return this.page.getByTestId('username');
  }

  get passwordInput(): Locator {
    return this.page.getByTestId('password');
  }

  get loginButton(): Locator {
    return this.page.getByTestId('login-button');
  }

  get errorMessage(): Locator {
    return this.page.getByTestId('error');
  }

  get dismissErrorButton(): Locator {
    return this.page.getByTestId('error-button');
  }
}
import { expect, Page } from '@playwright/test';
import { CheckoutPageLocators } from './checkout.locator';

export class CheckoutPageStepOne {
  public readonly locators: CheckoutPageLocators;

  constructor(protected page: Page) {
    this.locators = new CheckoutPageLocators(page);
  }

  public async navigateToCheckoutPage(): Promise<void> {
    await this.page.goto('/checkout-step-one.html');
  }
}

export class CheckoutPageStepTwo {
  public readonly locators: CheckoutPageLocators;

  constructor(protected page: Page) {
    this.locators = new CheckoutPageLocators(page);
  }

  public async navigateToCheckoutPage(): Promise<void> {
    await this.page.goto('/checkout-step-two.html');
  }
}

export class CheckoutPageComplete {
  public readonly locators: CheckoutPageLocators;

  constructor(protected page: Page) {
    this.locators = new CheckoutPageLocators(page);
  }

  public async navigateToCheckoutPage(): Promise<void> {
    await this.page.goto('/checkout-complete.html');
  }
}
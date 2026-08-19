import { expect, Page } from '@playwright/test';
import { CartPageLocators } from './cart.locators';

export class CartPage {
  public readonly locators: CartPageLocators;

  constructor(protected page: Page) {
    this.locators = new CartPageLocators(page);
  }

  public async navigateToCartPage(): Promise<void> {
    await this.page.goto('/cart.html');
  }
}
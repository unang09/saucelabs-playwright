import { expect, Page } from '@playwright/test';
import { InventoryPageLocators } from './inventory.locators';
import type { Product } from '../test-data/products';

export class InventoryPage {
  public readonly locators: InventoryPageLocators;

  constructor(protected page: Page) {
    this.locators = new InventoryPageLocators(page);
  }

  public async navigateToInventoryPage(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  public async expectInventoryPageRendered(): Promise<void> {
    await expect(this.page).toHaveURL(/\/inventory\.html/);
    await expect(this.locators.headerTitleProducts).toBeVisible();
    await expect(this.locators.inventoryItems).toHaveCount(6);
  }

  public async expectSessionUsername(username: string): Promise<void> {
    await expect
      .poll(async () => {
        const cookies = await this.page.context().cookies();
        return cookies.find((cookie) => cookie.name === 'session-username')?.value;
      })
      .toBe(username);
  }

  public async logout(): Promise<void> {
    await this.locators.headerBurgerMenu.click();
    await this.locators.sidebarMenuLogout.click();
  }

  public async addToCart(product: Product): Promise<void> {
    await this.locators.inventoryItemAddToCartButtons(product.slug).click();
  }

  public async expectShoppingCartAmount(itemQty: string): Promise<void> {
    await expect(this.locators.headerShoppingCartBadge).toHaveText(itemQty);
  }

  public async expectShoppingCartEmpty(): Promise<void> {
    await expect(this.locators.headerShoppingCartBadge).toBeHidden();
  }
}
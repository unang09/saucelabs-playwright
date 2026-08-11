import { expect, Locator, Page } from '@playwright/test';
import { InventoryPageLocators } from './inventory.locators';

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
}
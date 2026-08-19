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

  public async refreshInventoryPage(): Promise<void> {
    await this.page.reload();
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
    await this.locators.inventoryItemAddToCartButton(product.slug).click();
  }

  public async expectAddToCartButtonVisible(slug: string): Promise<void> {
    await expect(this.locators.inventoryItemAddToCartButton(slug)).toBeVisible();
  }

  public async removeFromCart(product: Product): Promise<void> {
    await this.locators.inventoryItemRemoveFromCartButton(product.slug).click();
  }

  public async expectRemoveFromCartButtonVisible(product: Product): Promise<void> {
    await expect(this.locators.inventoryItemRemoveFromCartButton(product.slug)).toBeVisible();
  }

  public async expectShoppingCartAmount(itemQty: string): Promise<void> {
    await expect(this.locators.headerShoppingCartBadge).toHaveText(itemQty);
  }

  public async expectShoppingCartEmpty(): Promise<void> {
    await expect(this.locators.headerShoppingCartBadge).toBeHidden();
  }

  public async expectProductNames(names: string[]): Promise<void> {
    await expect(this.locators.inventoryItemNames).toHaveText(names);
  }

  public async expectProductName(name: string): Promise<void> {
    await expect(this.locators.inventoryItemName(name)).toHaveCount(1);
  }

  public async expectProductPrices(prices: string[]): Promise<void> {
    await expect(this.locators.inventoryItemPrices).toHaveText(prices);
  }

  public async expectProductImg(slug: string): Promise<void> {
    await expect(this.locators.inventoryItemImg(slug)).toBeVisible();
  }

  public async expectProductCardComplete(product: Product): Promise<void> {
    await expect(this.locators.inventoryItemCard(product.id)).toHaveCount(1);
    await expect(this.locators.inventoryItemCardName(product.id)).toHaveText(product.name);
    await expect(this.locators.inventoryItemCardDescription(product.id)).toHaveText(product.description);
    await expect(this.locators.inventoryItemCardPrice(product.id)).toHaveText(product.price);
    await expect(this.locators.inventoryItemImg(product.slug)).toBeVisible();
    await expect(this.locators.inventoryItemAddToCartButton(product.slug)).toBeVisible();
  }

  public async expectAllImagesLoaded(): Promise<void> {
    await expect
      .poll(() =>
        this.locators.inventoryItemImgs.evaluateAll((imgs: HTMLImageElement[]) =>
          imgs.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src),
        ),
      )
      .toEqual([]);
  }

  public async expectNoPlaceholderImages(): Promise<void> {
    await expect
      .poll(() =>
        this.locators.inventoryItemImgs.evaluateAll((imgs: HTMLImageElement[]) =>
          imgs.map((img) => img.src).filter((src) => src.includes('sl-404')),
        ),
      )
      .toEqual([]);
  }

  public async expectNamesSortedAscending(): Promise<void> {
    await expect(this.locators.inventoryItems).toHaveCount(6);
    const names = await this.locators.inventoryItemNames.allTextContents();
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  }
}
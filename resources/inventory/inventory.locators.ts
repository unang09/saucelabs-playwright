import { Page, Locator } from '@playwright/test';

export class InventoryPageLocators {
  constructor(private page: Page) {}

  get headerBurgerMenu(): Locator {
    return this.page.getByRole('button', { name: 'Open Menu' });
  }

  get headerShoppingCart(): Locator {
    return this.page.getByTestId('shopping-cart-link');
  }

  get headerShoppingCartBadge(): Locator {
    return this.page.getByTestId('shopping-cart-badge');
  }

  get headerBurgerMenuCloseBttn(): Locator {
    return this.page.getByRole('button', { name: 'Close Menu' });
  }

  get headerTitleSwagLabs(): Locator {
    return this.page.getByText('Swag Labs');
  }

  get sidebarMenuAllItems(): Locator {
    return this.page.getByTestId('inventory-sidebar-link');
  }

  get sidebarMenuAbout(): Locator {
    return this.page.getByTestId('about-sidebar-link');
  }

  get sidebarMenuLogout(): Locator {
    return this.page.getByTestId('logout-sidebar-link');
  }

  get sidebarMenuResetAppState(): Locator {
    return this.page.getByTestId('reset-sidebar-link');
  }

  get headerTitleProducts(): Locator {
    return this.page.getByTestId('title');
  }

  get headerSortDropdown(): Locator {
    return this.page.getByTestId('product-sort-container');
  }

  get inventoryItems(): Locator {
    return this.page.getByTestId('inventory-item');
  }

  get inventoryItemNames(): Locator {
    return this.page.getByTestId('inventory-item-name');
  }

  get inventoryItemImgs(): Locator {
    return this.inventoryItems.locator('img');
  }

  public inventoryItemImg(slug: string): Locator {
    return this.page.getByTestId(`inventory-item-${slug}-img`);
  }

  public inventoryItemName(name: string): Locator {
    return this.page.getByTestId('inventory-item-name').getByText(name, { exact: true });
  }

  get inventoryItemDescriptions(): Locator {
    return this.page.getByTestId('inventory-item-desc');
  }

  public inventoryItemCard(id: string): Locator {
    return this.inventoryItems.filter({ has: this.page.getByTestId(`item-${id}-title-link`) });
  }

  public inventoryItemCardName(id: string): Locator {
    return this.inventoryItemCard(id).getByTestId('inventory-item-name');
  }

  public inventoryItemCardDescription(id: string): Locator {
    return this.inventoryItemCard(id).getByTestId('inventory-item-desc');
  }

  public inventoryItemCardPrice(id: string): Locator {
    return this.inventoryItemCard(id).getByTestId('inventory-item-price');
  }

  get inventoryItemPrices(): Locator {
    return this.page.getByTestId('inventory-item-price');
  }

  public inventoryItemAddToCartButton(slug: string): Locator {
    return this.page.getByTestId(`add-to-cart-${slug}`);
  }

  public inventoryItemRemoveFromCartButton(slug: string): Locator {
    return this.page.getByTestId(`remove-${slug}`);
  }
}
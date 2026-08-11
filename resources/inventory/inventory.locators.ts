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

  get inventoryItemDescriptions(): Locator {
    return this.page.getByTestId('inventory-item-description');
  }

  get inventoryItemPrices(): Locator {
    return this.page.getByTestId('inventory-item-price');
  }

  public inventoryItemAddToCartButtons(slug: string): Locator {
    return this.page.getByTestId(`add-to-cart-${slug}`);
  }

  public inventoryItemRemoveFromCartButtons(slug: string): Locator {
    return this.page.getByTestId(`remove-${slug}`);
  }
}
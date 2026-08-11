import { test as base } from '@playwright/test';
import { InventoryPage } from '../../resources/inventory/inventory.page';

export type InventoryFixtures = {
  inventoryPage: InventoryPage;
};

export const test = base.extend<InventoryFixtures>({
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
});

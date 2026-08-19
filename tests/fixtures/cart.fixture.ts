import { test as base } from '@playwright/test';
import { CartPage } from '../../resources/cart/cart.page';

export type CartFixtures = {
  cartPage: CartPage;
};

export const test = base.extend<CartFixtures>({
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
});
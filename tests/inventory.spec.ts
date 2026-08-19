import { test } from './fixtures/merge.fixture';
import { users } from '../resources/test-data/users';
import { products } from '../resources/test-data/products';

test.describe('Inventory Test Suites', () => {
  test.use({ sessionUser: users.standard });

  test('TC-INV-01: Six products are listed', async ({ inventoryPage }) => {
    await inventoryPage.navigateToInventoryPage();
    await inventoryPage.expectInventoryPageRendered();
  });

  test('TC-INV-02: Product names match the catalogue', async ({ inventoryPage }) => {
    await inventoryPage.navigateToInventoryPage();
    await inventoryPage.expectInventoryPageRendered();
    await inventoryPage.expectProductNames([
      products.backpack.name,
      products.bikeLight.name,
      products.boltTShirt.name,
      products.fleeceJacket.name,
      products.onesie.name,
      products.allTheThings.name,
    ]);
  });

  test('TC-INV-03: Product prices match the catalogue', async ({ inventoryPage }) => {
    await inventoryPage.navigateToInventoryPage();
    await inventoryPage.expectInventoryPageRendered();
    await inventoryPage.expectProductPrices([
      products.backpack.price,
      products.bikeLight.price,
      products.boltTShirt.price,
      products.fleeceJacket.price,
      products.onesie.price,
      products.allTheThings.price,
    ]);
  });

  test('TC-INV-04: Every product has name, description, price, image and button', async ({ inventoryPage }) => {
    await inventoryPage.navigateToInventoryPage();
    await inventoryPage.expectInventoryPageRendered();

    for (const product of Object.values(products)) {
      await inventoryPage.expectProductCardComplete(product);
    }
  });

  test('TC-INV-05: Page title reads "Products"', async ({ inventoryPage }) => {
    await inventoryPage.navigateToInventoryPage();
    await inventoryPage.expectInventoryPageRendered();
  });

  test('TC-INV-06: Add a single item updates the badge', async ({ inventoryPage }) => {
    await inventoryPage.navigateToInventoryPage();
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.expectShoppingCartAmount('1');
    await inventoryPage.expectRemoveFromCartButtonVisible(products.backpack);
  })
});
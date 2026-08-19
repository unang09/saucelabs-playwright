import { test } from './fixtures/merge.fixture';
import { users } from '../resources/test-data/users';
import { products } from '../resources/test-data/products';

test('TC-SES-01: Deep link to inventory while logged out', async ({ loginPage, inventoryPage }) => {
  await inventoryPage.navigateToInventoryPage();
  await loginPage.expectErrorMessageVisible();
  await loginPage.expectErrorMessageText("Epic sadface: You can only access '/inventory.html' when you are logged in.");
});

test('TC-SES-02: Deep link to cart while logged out', async ({ loginPage, cartPage }) => {
  await cartPage.navigateToCartPage();
  await loginPage.expectErrorMessageVisible();
  await loginPage.expectErrorMessageText("Epic sadface: You can only access '/cart.html' when you are logged in.");
});

test.describe('TC-SES-03:Deep link to checkout', () => {
  test('Deep link to checkout step one while logged out', async ({ loginPage, checkoutPageStepOne }) => {
    await checkoutPageStepOne.navigateToCheckoutPage();
    await loginPage.expectErrorMessageVisible();
    await loginPage.expectErrorMessageText("Epic sadface: You can only access '/checkout-step-one.html' when you are logged in.");
  });

  test('Deep link to checkout step two while logged out', async ({ loginPage, checkoutPageStepTwo }) => {
    await checkoutPageStepTwo.navigateToCheckoutPage();
    await loginPage.expectErrorMessageVisible();
    await loginPage.expectErrorMessageText("Epic sadface: You can only access '/checkout-step-two.html' when you are logged in.");
  });

  test('Deep link to checkout complete while logged out', async ({ loginPage, checkoutPageComplete }) => {
    await checkoutPageComplete.navigateToCheckoutPage();
    await loginPage.expectErrorMessageVisible();
    await loginPage.expectErrorMessageText("Epic sadface: You can only access '/checkout-complete.html' when you are logged in.");
  });
});

test.describe('Logout clears the session', () => {
  test.use({ sessionUser: users.standard });

  test('TC-SES-04: Logout clears the session', async ({ loginPage, inventoryPage }) => {
    await inventoryPage.navigateToInventoryPage();
    await inventoryPage.expectSessionUsername(users.standard);
    await inventoryPage.logout();
    await loginPage.expectLoginPageRendered();
    await loginPage.expectNoSessionCookie();
  });
});

test.describe('Back button after logout does not restore the session', () => {
  test.use({ sessionUser: users.standard });

  test('TC-SES-05: Back button after logout does not restore the session', async ({ loginPage, inventoryPage }) => {
    await inventoryPage.navigateToInventoryPage();
    await inventoryPage.expectSessionUsername(users.standard);
    await inventoryPage.logout();
    await loginPage.expectLoginPageRendered();
    await loginPage.navigateBack();
    await loginPage.expectNoSessionCookie();
    await loginPage.expectErrorMessageText("Epic sadface: You can only access '/inventory.html' when you are logged in.");
  });
});

test.describe('Cart survives logout and re-login', () => {
  test.use({ sessionUser: users.standard});

  test('TC-SES-06: Cart survives logout and re-login', async ({ loginPage, inventoryPage}) => {
    await inventoryPage.navigateToInventoryPage();
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.logout();
    await loginPage.expectLoginPageRendered();
    await loginPage.login(users.standard,users.password);
    await inventoryPage.expectShoppingCartAmount('1');
  });
});

// Marked the test block as failed. The Cart is not isolated per user. This is the current app behavior, which in QA perspective is still a bug/defect.
test.fail('TC-SES-07: Cart is isolated per user', async ({ loginPage, inventoryPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.login(users.standard,users.password);
  await inventoryPage.addToCart(products.backpack);
  await inventoryPage.expectShoppingCartAmount('1');
  await inventoryPage.logout();
  await loginPage.expectNoSessionCookie();
  await loginPage.login(users.problem,users.password);
  await inventoryPage.expectShoppingCartEmpty();
});

test.describe('Session survives a page refresh', () => {
  test.use({ sessionUser: users.standard});

  test('TC-SES-08: Session survives a page refresh', async ({ inventoryPage }) => {
    await inventoryPage.navigateToInventoryPage();
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.expectShoppingCartAmount('1');
    await inventoryPage.refreshInventoryPage();
    await inventoryPage.expectSessionUsername(users.standard);
    await inventoryPage.expectInventoryPageRendered();
    await inventoryPage.expectShoppingCartAmount('1');
  });
});

test.describe('Manually deleting the session cookie logs the user out', () => {
  test.use({ sessionUser: users.standard });

  test('TC-SES-09: Manually deleting the session cookie logs the user out', async ({ loginPage, inventoryPage, session }) => {
    await inventoryPage.navigateToInventoryPage();
    await inventoryPage.expectSessionUsername(users.standard);
    
    await session.deleteSessionCookie();
    await loginPage.expectNoSessionCookie();
    
    await inventoryPage.navigateToInventoryPage();
    await loginPage.expectLoginPageRendered();
    await loginPage.expectErrorMessageText("Epic sadface: You can only access '/inventory.html' when you are logged in.");
  });
});

test.describe('Forged session cookie value', () => {
  test.use({ sessionUser: 'hacker' });

  test('TC-SES-10: Forged session cookie value', async ({ loginPage, inventoryPage }) => {
    await inventoryPage.navigateToInventoryPage();
    await loginPage.expectLoginPageRendered();
    await loginPage.expectErrorMessageText("Epic sadface: You can only access '/inventory.html' when you are logged in.");
  });
});

test.describe('Forged cookie for the locked-out user', () => {
  test.use({ sessionUser: users.lockedOut});

  test('TC-SES-11: Forged cookie for the locked-out user', async ({ loginPage, inventoryPage}) => {
    await inventoryPage.navigateToInventoryPage();
    await loginPage.expectLoginPageRendered();
    await loginPage.expectErrorMessageText("Epic sadface: You can only access '/inventory.html' when you are logged in.");
  });
});
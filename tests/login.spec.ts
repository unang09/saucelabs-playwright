import { test } from './fixtures/merge.fixture';
import { users } from '../resources/test-data/users';

test('TC-LOGIN-01: Login with "standard_user"', async ({ loginPage, inventoryPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.login(users.standard, users.password);
  await inventoryPage.expectInventoryPageRendered();
  await inventoryPage.expectSessionUsername(users.standard);
});

test('TC-LOGIN-02: Login with "problem_user"', async ({ loginPage, inventoryPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.login(users.problem, users.password);
  await inventoryPage.expectInventoryPageRendered();
  await inventoryPage.expectSessionUsername(users.problem);
});

test('TC-LOGIN-03: Login with "performance_glitch_user"', async ({ loginPage, inventoryPage }) => {
  test.slow();
  await loginPage.navigateToLoginPage();
  await loginPage.expectLoginSlowerThan(users.performanceGlitch, users.password, 2000);
  await inventoryPage.expectInventoryPageRendered();
  await inventoryPage.expectSessionUsername(users.performanceGlitch);
});

test('TC-LOGIN-04: Login with "error_user"', async ({ loginPage, inventoryPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.login(users.error, users.password);
  await inventoryPage.expectInventoryPageRendered();
  await inventoryPage.expectSessionUsername(users.error);
});

test('TC-LOGIN-05: Login with "visual_user"', async ({ loginPage, inventoryPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.login(users.visual, users.password);
  await inventoryPage.expectInventoryPageRendered();
  await inventoryPage.expectSessionUsername(users.visual);
});

test('TC-LOGIN-06: Locked-out user is rejected', async ({ loginPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.login(users.lockedOut, users.password);
  await loginPage.expectErrorMessageVisible();
  await loginPage.expectErrorMessageText('Epic sadface: Sorry, this user has been locked out.');
});

test('TC-LOGIN-07: Submit with both fields empty', async ({ loginPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.login('', '');
  await loginPage.expectErrorMessageVisible();
  await loginPage.expectErrorMessageText('Epic sadface: Username is required');
});

test('TC-LOGIN-08: Submit with username only', async ({ loginPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.login(users.standard, '');
  await loginPage.expectErrorMessageVisible();
  await loginPage.expectErrorMessageText('Epic sadface: Password is required');
});

test('TC-LOGIN-09: Submit with password only', async ({ loginPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.login('', users.password);
  await loginPage.expectErrorMessageVisible();
  await loginPage.expectErrorMessageText('Epic sadface: Username is required');
});

test('TC-LOGIN-10: Valid username, wrong password', async ({ loginPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.login(users.standard, 'wrong_password');
  await loginPage.expectErrorMessageVisible();
  await loginPage.expectErrorMessageText('Epic sadface: Username and password do not match any user in this service');
});

test('TC-LOGIN-11: Unknown username, valid password', async ({ loginPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.login('unknown_user', users.password);
  await loginPage.expectErrorMessageVisible();
  await loginPage.expectErrorMessageText('Epic sadface: Username and password do not match any user in this service');
});

test('TC-LOGIN-12: Both credentials wrong', async ({ loginPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.login('foo', 'bar');
  await loginPage.expectErrorMessageVisible();
  await loginPage.expectErrorMessageText('Epic sadface: Username and password do not match any user in this service');
});

test('TC-LOGIN-13: Username is case-sensitive', async ({ loginPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.login(users.standard.toUpperCase(), users.password);
  await loginPage.expectErrorMessageVisible();
  await loginPage.expectErrorMessageText('Epic sadface: Username and password do not match any user in this service');
});

test('TC-LOGIN-14: Password is case-sensitive', async ({ loginPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.login(users.standard, users.password.toUpperCase());
  await loginPage.expectErrorMessageVisible();
  await loginPage.expectErrorMessageText('Epic sadface: Username and password do not match any user in this service');
});

test('TC-LOGIN-15: Leading/trailing whitespace is not trimmed', async ({ loginPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.login(`   ${users.standard}   `, `   ${users.password}   `);
  await loginPage.expectErrorMessageVisible();
  await loginPage.expectErrorMessageText('Epic sadface: Username and password do not match any user in this service');
});

test('TC-LOGIN-16: Whitespace-only input is rejected', async ({ loginPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.login('   ', '   ');
  await loginPage.expectErrorMessageVisible();
  await loginPage.expectErrorMessageText('Epic sadface: Username and password do not match any user in this service');
});

test('TC-LOGIN-17: Very long username (500 characters)', async ({ loginPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.login('a'.repeat(500), users.password);
  await loginPage.expectErrorMessageVisible();
  await loginPage.expectErrorMessageText('Epic sadface: Username and password do not match any user in this service');
});

test('TC-LOGIN-18: SQL injection style payload', async ({ loginPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.login('\' OR 1=1; --', users.password);
  await loginPage.expectErrorMessageVisible();
  await loginPage.expectErrorMessageText('Epic sadface: Username and password do not match any user in this service');
});

test('TC-LOGIN-19: XSS style payload', async ({ loginPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.login('<script>alert("XSS")</script>', users.password);
  await loginPage.expectErrorMessageVisible();
  await loginPage.expectErrorMessageText('Epic sadface: Username and password do not match any user in this service');
});

test('TC-LOGIN-20: Password field masks input', async ({ loginPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.expectPasswordFieldMasked();
});

test('TC-LOGIN-21: Submit via Enter key', async ({ loginPage, inventoryPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.fillUsername(users.standard);
  await loginPage.fillPassword(users.password);
  await loginPage.submitLoginWithEnter();
  await inventoryPage.expectInventoryPageRendered();
  await inventoryPage.expectSessionUsername(users.standard);
});

test('TC-LOGIN-22: Error message is dismissible', async ({ loginPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.login(users.lockedOut, users.password);
  await loginPage.expectErrorMessageVisible();
  await loginPage.dismissErrorMessage();
  await loginPage.expectErrorMessageNotVisible();
});

test('TC-LOGIN-23: Error clears on next valid attempt', async ({ loginPage, inventoryPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.login(users.lockedOut, users.password);
  await loginPage.expectErrorMessageVisible();
  await loginPage.login(users.standard, users.password);
  await inventoryPage.expectInventoryPageRendered();
  await inventoryPage.expectSessionUsername(users.standard);
  await loginPage.expectErrorMessageNotVisible();
});

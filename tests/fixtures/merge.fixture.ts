import { mergeTests } from '@playwright/test';

import { test as sessionTest } from './session.fixture';
import { test as loginTest } from './login.fixture';
import { test as inventoryTest } from './inventory.fixture';
import { test as cartTest } from './cart.fixture';
import { test as checkoutTest } from './checkout.fixture';

export const test = mergeTests(
  sessionTest,
  loginTest,
  inventoryTest,
  cartTest,
  checkoutTest,
);

export { expect } from '@playwright/test';
export * from '../../resources/config/env.config';

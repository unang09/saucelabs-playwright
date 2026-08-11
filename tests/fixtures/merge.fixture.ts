import { mergeTests } from '@playwright/test';

import { test as sessionTest } from './session.fixture';
import { test as loginTest } from './login.fixture';
import { test as inventoryTest } from './inventory.fixture';

export const test = mergeTests(
  sessionTest,
  loginTest,
  inventoryTest,
);

export { expect } from '@playwright/test';
export * from '../../resources/config/env.config';

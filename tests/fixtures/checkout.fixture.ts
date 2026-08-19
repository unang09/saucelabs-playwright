import { test as base } from '@playwright/test';
import { CheckoutPageComplete, CheckoutPageStepOne, CheckoutPageStepTwo } from '../../resources/checkout/checkout.page';

export type CheckoutFixtures = {
  checkoutPageStepOne: CheckoutPageStepOne;
  checkoutPageStepTwo: CheckoutPageStepTwo;
  checkoutPageComplete: CheckoutPageComplete;
};

export const test = base.extend<CheckoutFixtures>({
  checkoutPageStepOne: async ({ page }, use) => {
    await use(new CheckoutPageStepOne(page));
  },
  checkoutPageStepTwo: async ({ page }, use) => {
    await use(new CheckoutPageStepTwo(page));
  },
  checkoutPageComplete: async ({ page }, use) => {
    await use(new CheckoutPageComplete(page));
  },
});
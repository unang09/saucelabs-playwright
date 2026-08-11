import { test as base } from '@playwright/test';
import { env } from '../../resources/config/env.config';

export type SessionFixtures = {
  sessionUser: string | null;
  seedSession: void;
};

export const test = base.extend<SessionFixtures>({
  sessionUser: [null, { option: true }],

  seedSession: [
    async ({ page, sessionUser }, use) => {
      if (sessionUser) {
        await page.context().addCookies([
          {
            name: 'session-username',
            value: sessionUser,
            domain: new URL(env.BASE_URL).hostname,
            path: '/',
          },
        ]);
      }
      await use();
    },
    { auto: true },
  ],
});

import { test as base } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_DIR = path.join(__dirname, '../../../playwright/.auth');

export const test = base.extend<{
  emailVerifiedUserPage: import('@playwright/test').Page;
  subscribedUserPage: import('@playwright/test').Page;
}>({
  async emailVerifiedUserPage({ browser }, use) {
    const context = await browser.newContext({
      storageState: path.join(AUTH_DIR, 'emailVerifiedUser.json'),
      baseURL: 'http://localhost:5173',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  async subscribedUserPage({ browser }, use, testInfo) {
    const statePath = path.join(AUTH_DIR, `subscribedUser.worker-${testInfo.parallelIndex}.json`);
    const context = await browser.newContext({
      storageState: statePath,
      baseURL: 'http://localhost:5173',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';

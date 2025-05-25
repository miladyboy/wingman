import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { registerAndConfirmUser, completeSubscription, loginUser, TEST_PASSWORD } from './e2e/utils/userFlows';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_DIR = path.join(__dirname, '../playwright/.auth');
const EMAIL_VERIFIED_FILE = path.join(AUTH_DIR, 'emailVerifiedUser.json');
const SUBSCRIBED_FILE_PREFIX = path.join(AUTH_DIR, 'subscribedUser.worker-');
const BASE_URL = 'http://localhost:5173';

function getWorkerCount() {
  // Playwright sets this env var for parallel runs
  return parseInt(process.env.PLAYWRIGHT_WORKERS || '1', 10);
}

async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function globalSetup() {
  console.log('--- Playwright globalSetup: START ---');
  await ensureDir(AUTH_DIR);

  // --- Global Email Verified User ---
  console.log('Setting up global email verified user...');
  const emailVerified = process.env.PLAYWRIGHT_TEST_EMAIL_VERIFIED || 'e2e-verified@local.test';
  const passwordVerified = process.env.PLAYWRIGHT_TEST_PASSWORD_VERIFIED || TEST_PASSWORD;

  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL: BASE_URL });
  const page = await context.newPage();

  let needRegisterVerified = !process.env.PLAYWRIGHT_TEST_EMAIL_VERIFIED;
  if (needRegisterVerified) {
    // Try to login first, if fails, register
    try {
      console.log('Trying to login global verified user:', emailVerified);
      await loginUser(page, emailVerified, passwordVerified);
      console.log('Login successful for global verified user.');
    } catch (err) {
      console.log('Login failed, registering new global verified user:', emailVerified);
      const creds = await registerAndConfirmUser(page, { usernamePrefix: 'verifiedUser' });
      // Overwrite email/password if new user
      process.env.PLAYWRIGHT_TEST_EMAIL_VERIFIED = creds.email;
      process.env.PLAYWRIGHT_TEST_PASSWORD_VERIFIED = creds.password;
      console.log('Registered new global verified user:', creds.email);
    }
  } else {
    console.log('Logging in with provided global verified user:', emailVerified);
    await loginUser(page, emailVerified, passwordVerified);
  }
  await page.context().storageState({ path: EMAIL_VERIFIED_FILE });
  console.log('Saved storage state for global verified user:', EMAIL_VERIFIED_FILE);
  await page.close();
  await context.close();

  // --- Subscribed User Per Worker ---
  const workerCount = getWorkerCount();
  console.log(`Setting up ${workerCount} subscribed users (one per parallelIndex)...`);
  const subscribedUserPromises = [];
  for (let parallelIndex = 0; parallelIndex < workerCount; parallelIndex++) {
    subscribedUserPromises.push((async () => {
      const subscribedEmail = process.env[`PLAYWRIGHT_TEST_EMAIL_SUBSCRIBED_${parallelIndex}`] || `e2e-subscribed-worker-${parallelIndex}@local.test`;
      const subscribedPassword = process.env[`PLAYWRIGHT_TEST_PASSWORD_SUBSCRIBED_${parallelIndex}`] || TEST_PASSWORD;
      const browserSub = await chromium.launch();
      const contextSub = await browserSub.newContext({ baseURL: BASE_URL });
      const pageSub = await contextSub.newPage();
      let needRegisterSubscribed = !process.env[`PLAYWRIGHT_TEST_EMAIL_SUBSCRIBED_${parallelIndex}`];
      if (needRegisterSubscribed) {
        try {
          console.log(`[ParallelIndex ${parallelIndex}] Trying to login subscribed user:`, subscribedEmail);
          await loginUser(pageSub, subscribedEmail, subscribedPassword);
          console.log(`[ParallelIndex ${parallelIndex}] Login successful for subscribed user.`);
        } catch (err) {
          console.log(`[ParallelIndex ${parallelIndex}] Login failed, registering new subscribed user:`, subscribedEmail);
          const creds = await registerAndConfirmUser(pageSub, { usernamePrefix: `subscribedUser${parallelIndex}` });
          await completeSubscription(pageSub);
          process.env[`PLAYWRIGHT_TEST_EMAIL_SUBSCRIBED_${parallelIndex}`] = creds.email;
          process.env[`PLAYWRIGHT_TEST_PASSWORD_SUBSCRIBED_${parallelIndex}`] = creds.password;
          console.log(`[ParallelIndex ${parallelIndex}] Registered and subscribed new user:`, creds.email);
        }
      } else {
        console.log(`[ParallelIndex ${parallelIndex}] Logging in with provided subscribed user:`, subscribedEmail);
        await loginUser(pageSub, subscribedEmail, subscribedPassword);
      }
      await pageSub.context().storageState({ path: `${SUBSCRIBED_FILE_PREFIX}${parallelIndex}.json` });
      console.log(`[ParallelIndex ${parallelIndex}] Saved storage state:`, `${SUBSCRIBED_FILE_PREFIX}${parallelIndex}.json`);
      await pageSub.close();
      await contextSub.close();
      await browserSub.close();
    })());
  }
  await Promise.all(subscribedUserPromises);
  console.log('All subscribed users setup complete.');

  await browser.close();
  console.log('--- Playwright globalSetup: COMPLETE ---');
}

export default globalSetup;

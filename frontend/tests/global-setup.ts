import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";
import {
  registerAndConfirmUser,
  completeSubscription,
  loginUser,
  TEST_PASSWORD,
} from "./e2e/utils/userFlows";
import { fileURLToPath } from "url";
import { logStep, logError, logWorker, logDebug } from "./e2e/utils/logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_DIR = path.join(__dirname, "../playwright/.auth");
const EMAIL_VERIFIED_FILE = path.join(AUTH_DIR, "emailVerifiedUser.json");
const SUBSCRIBED_FILE_PREFIX = path.join(AUTH_DIR, "subscribedUser.worker-");
const BASE_URL = "http://localhost:5173";

function getWorkerCount() {
  // Playwright sets this env var for parallel runs
  const count = parseInt(process.env.PLAYWRIGHT_WORKERS || "1", 10);
  logDebug("Detected worker count", {
    count,
    env: process.env.PLAYWRIGHT_WORKERS,
  });
  return count;
}

async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logDebug("Created directory", { dir });
  }
}

async function setupEmailVerifiedUser() {
  logStep("Setting up global email verified user");

  const emailVerified =
    process.env.PLAYWRIGHT_TEST_EMAIL_VERIFIED || "e2e-verified@local.test";
  const passwordVerified =
    process.env.PLAYWRIGHT_TEST_PASSWORD_VERIFIED || TEST_PASSWORD;

  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL: BASE_URL });
  const page = await context.newPage();

  try {
    const needRegisterVerified = !process.env.PLAYWRIGHT_TEST_EMAIL_VERIFIED;
    if (needRegisterVerified) {
      // Try to login first, if fails, register
      try {
        logDebug("Trying to login global verified user", {
          email: emailVerified,
        });
        await loginUser(page, emailVerified, passwordVerified);
        logStep("Login successful for global verified user");
      } catch (err) {
        logDebug("Login failed, registering new global verified user", {
          email: emailVerified,
        });
        const creds = await registerAndConfirmUser(page);
        // Overwrite email/password if new user
        process.env.PLAYWRIGHT_TEST_EMAIL_VERIFIED = creds.email;
        process.env.PLAYWRIGHT_TEST_PASSWORD_VERIFIED = creds.password;
        logStep("Registered new global verified user", { email: creds.email });
      }
    } else {
      logDebug("Logging in with provided global verified user", {
        email: emailVerified,
      });
      await loginUser(page, emailVerified, passwordVerified);
    }

    await page.context().storageState({ path: EMAIL_VERIFIED_FILE });
    logStep("Saved storage state for global verified user", {
      path: EMAIL_VERIFIED_FILE,
    });
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
}

async function setupSubscribedUser(parallelIndex: number): Promise<void> {
  logWorker(parallelIndex, "Starting subscribed user setup");

  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL: BASE_URL });
  const page = await context.newPage();

  try {
    // Check if we have pre-existing credentials from environment variables
    const existingEmail =
      process.env[`PLAYWRIGHT_TEST_EMAIL_SUBSCRIBED_${parallelIndex}`];
    const existingPassword =
      process.env[`PLAYWRIGHT_TEST_PASSWORD_SUBSCRIBED_${parallelIndex}`] ||
      TEST_PASSWORD;

    if (existingEmail) {
      // We have existing credentials, try to login
      try {
        logWorker(
          parallelIndex,
          "Trying to login with existing subscribed user",
          {
            email: existingEmail,
          }
        );
        await loginUser(page, existingEmail, existingPassword);
        logWorker(
          parallelIndex,
          "Login successful for existing subscribed user"
        );
      } catch (err) {
        logWorker(
          parallelIndex,
          "Login failed for existing user, will register new one",
          {
            email: existingEmail,
            error: err instanceof Error ? err.message : String(err),
          }
        );
        // Fall through to registration
        await registerAndSubscribeNewUser(parallelIndex, page);
      }
    } else {
      // No existing credentials, register a new user
      logWorker(
        parallelIndex,
        "No existing credentials found, registering new subscribed user"
      );
      await registerAndSubscribeNewUser(parallelIndex, page);
    }

    const storageStatePath = `${SUBSCRIBED_FILE_PREFIX}${parallelIndex}.json`;
    await page.context().storageState({ path: storageStatePath });
    logWorker(parallelIndex, "Saved storage state", { path: storageStatePath });
  } catch (error) {
    logError(`Worker ${parallelIndex} setup failed`, {
      parallelIndex,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
}

async function registerAndSubscribeNewUser(
  parallelIndex: number,
  page: any
): Promise<void> {
  // Use more unique email pattern to avoid conflicts
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const newEmail = `e2e-subscribed-worker-${parallelIndex}-${timestamp}-${random}@local.test`;

  logWorker(parallelIndex, "Registering new subscribed user", {
    email: newEmail,
  });

  const creds = await registerAndConfirmUser(page);

  logWorker(parallelIndex, "Registration completed, starting subscription");
  await completeSubscription(page);

  // Store the new credentials in environment variables for potential reuse
  process.env[`PLAYWRIGHT_TEST_EMAIL_SUBSCRIBED_${parallelIndex}`] =
    creds.email;
  process.env[`PLAYWRIGHT_TEST_PASSWORD_SUBSCRIBED_${parallelIndex}`] =
    creds.password;

  logWorker(parallelIndex, "Registered and subscribed new user", {
    email: creds.email,
  });
}

async function globalSetup() {
  logStep("--- Playwright globalSetup: START ---");
  await ensureDir(AUTH_DIR);

  try {
    // Setup global email verified user first
    await setupEmailVerifiedUser();

    // Setup subscribed users in parallel now that we've fixed the email conflicts
    const workerCount = getWorkerCount();
    logStep(
      `Setting up ${workerCount} subscribed users (one per parallelIndex) in parallel`
    );

    // Process workers in parallel for faster setup
    const subscribedUserPromises = [];
    for (let parallelIndex = 0; parallelIndex < workerCount; parallelIndex++) {
      subscribedUserPromises.push(setupSubscribedUser(parallelIndex));
    }
    await Promise.all(subscribedUserPromises);

    logStep("All subscribed users setup complete");
  } catch (error) {
    logError("Global setup failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  logStep("--- Playwright globalSetup: COMPLETE ---");
}

export default globalSetup;

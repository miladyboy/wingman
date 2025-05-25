import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
// import path from 'path'; // No longer strictly needed here if not using path.resolve for storageState

dotenv.config();

export default defineConfig({
  testDir: "./tests/e2e",
<<<<<<< HEAD
  /* Maximum time one test can run for. */
=======
>>>>>>> main
  timeout: 60 * 1000,
  expect: {
    /** Maximum time expect() should wait for the condition to be met. */
    timeout: 10000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "list",
<<<<<<< HEAD
  globalSetup: "./tests/global-setup.ts",
=======
>>>>>>> main
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:5173",
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },
  /* Configure projects for major browsers */
  projects: [
    {
<<<<<<< HEAD
=======
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      timeout: 5 * 60 * 1000, // Increased timeout for multiple user creations
    },
    {
>>>>>>> main
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // No global storageState here; tests will use test.use() or a default empty state.
      },
<<<<<<< HEAD
=======
      dependencies: ["setup"],
>>>>>>> main
    },
    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     // No global storageState here.
    //   },
    //   dependencies: ['setup'],
    // },
    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //     // No global storageState here.
    //   },
    //   dependencies: ['setup'],
    // },
  ],
});

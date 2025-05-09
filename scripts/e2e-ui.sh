#!/bin/sh

# Exit on error
set -e

# Step 1: Delete all files in the .auth folder
AUTH_DIR="frontend/playwright/.auth"
echo "[reset-auth-and-ui.sh] Deleting all files in $AUTH_DIR..."
rm -f $AUTH_DIR/*
echo "[reset-auth-and-ui.sh] All auth files deleted."

# Step 2: Run the Playwright setup project (auth.setup.ts)
echo "[reset-auth-and-ui.sh] Running Playwright auth setup..."
cd frontend && npx playwright test tests/e2e/auth.setup.ts

echo "[reset-auth-and-ui.sh] Auth setup complete."

# Step 3: Start Playwright tests in --ui mode
echo "[reset-auth-and-ui.sh] Launching Playwright UI..."
npx playwright test --ui 
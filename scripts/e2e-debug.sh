#!/bin/sh

# E2E Debug Script - Run Playwright tests with verbose logging

echo "🔍 Running E2E tests with debug logging..."

# Change to frontend directory and run Playwright tests
cd frontend && E2E_LOG_LEVEL=debug npx playwright test "$@" 
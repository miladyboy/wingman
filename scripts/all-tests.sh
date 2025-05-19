#!/bin/sh
set -e

# Run backend tests
echo "\n=== Running backend tests ==="
npm run test --prefix backend

# Run frontend tests
echo "\n=== Running frontend tests ==="
npm run test --prefix frontend

# Run E2E tests
echo "\n=== Running E2E tests ==="
./scripts/e2e.sh 
#!/bin/sh
cd frontend && npx playwright test --workers=1 "$@" 
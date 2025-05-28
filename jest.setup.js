/**
 * Jest setup file to ensure test environment variables are properly set.
 * This file runs before each test file.
 */

// Ensure NODE_ENV is set to 'test' for all Jest runs
process.env.NODE_ENV = "test";

// Add any other global test setup here if needed

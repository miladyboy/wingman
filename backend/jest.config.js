module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(test).js'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/controllers/**/*.js',
    '**/services/**/*.js',
    '!**/node_modules/**',
    '!**/__tests__/**'
  ],
  coverageDirectory: './coverage',
}; 
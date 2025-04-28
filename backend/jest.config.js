module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(test).js',
    '**/__tests__/**/*.ts',
    '**/?(*.)+(test).ts',
    '**/__tests__/**/*.tsx',
    '**/?(*.)+(test).tsx'
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
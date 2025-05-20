module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(test).ts',
    '**/__tests__/**/*.tsx',
    '**/?(*.)+(test).tsx'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/controllers/**/*.ts',
    '**/services/**/*.ts',
    '!**/node_modules/**',
    '!**/__tests__/**'
  ],
  coverageDirectory: './coverage',
  setupFiles: ['./jest.setup.js'],
}; 
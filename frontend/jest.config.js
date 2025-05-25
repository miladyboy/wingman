export default {
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest',
    },
    setupFiles: ['<rootDir>/jest.setup.js'],
    setupFilesAfterEnv: ['@testing-library/jest-dom', '<rootDir>/src/setupTests.ts'],
    moduleNameMapper: {
      '\\.(svg)$': '<rootDir>/__mocks__/svgMock.js',
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      '^@/(.*)$': '<rootDir>/src/$1',
    },
    testPathIgnorePatterns: [
      "\\.spec\\.(ts|tsx|js|jsx)$",
    ],
  };
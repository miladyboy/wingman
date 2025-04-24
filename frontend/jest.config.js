export default {
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js', 'jsx'],
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest',
    },
    setupFiles: ['<rootDir>/jest.setup.js'],
    setupFilesAfterEnv: ['@testing-library/jest-dom', '<rootDir>/src/setupTests.js'],
    moduleNameMapper: {
      '\\.(svg)$': '<rootDir>/__mocks__/svgMock.js',
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
  };
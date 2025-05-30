export default {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom', 
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};

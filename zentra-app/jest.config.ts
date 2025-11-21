import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        isolatedModules: true,
      },
      babelConfig: false,
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|@supabase|@stripe|react-native-reanimated|expo|expo-modules-core)/)'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/', '/build/', '/.expo/'],
  moduleNameMapper: {
    '\\.(svg)$': '<rootDir>/__tests__/mocks/svgMock.ts',
    '\\.(png|jpg|jpeg|gif)$': '<rootDir>/__tests__/mocks/imageMock.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  testMatch: [
    '<rootDir>/__tests__/services/**/*.test.ts',
  ],
  maxWorkers: '50%',
  bail: false,
  verbose: false,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/app/**',
  ],
};

export default config;
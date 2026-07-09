module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
    moduleNameMapper: {
        '^@site/(.*)$': '<rootDir>/$1',
        '^@theme/(.*)$': '<rootDir>/src/theme/$1',
        '^@generated/(.*)$': '<rootDir>/.docusaurus/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/__mocks__/fileMock.js',
        // Docusaurus packages that are not installed as regular npm packages
        // (they are provided by the Docusaurus runtime and not resolvable by Jest)
        '^@docusaurus/Link$': '<rootDir>/__mocks__/@docusaurus/Link.js',
        '^@docusaurus/useBaseUrl$': '<rootDir>/__mocks__/@docusaurus/useBaseUrl.js',
        '^@docusaurus/theme-common$': '<rootDir>/__mocks__/@docusaurus/theme-common.js',
        '^@docusaurus/useDocusaurusContext$': '<rootDir>/__mocks__/@docusaurus/useDocusaurusContext.js',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {
                jsx: 'react',
                esModuleInterop: true,
            },
        }],
    },
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/__tests__/**',
        '!src/**/*.test.{ts,tsx}',
        '!src/**/*.spec.{ts,tsx}',
    ],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },
};

const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');

module.exports = [
    {
        ignores: [
            'build/**',
            'node_modules/**',
            '.docusaurus/**',
            'static/**',
            '*.config.js',
            '*.config.ts',
            '.cache/**',
            'backend/**/dist/**',
        ],
    },
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        ignores: ['src/_scripts/**/*.js', 'src/plugins/**/*.js'],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            parser: typescriptParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                fetch: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                URL: 'readonly',
                URLSearchParams: 'readonly',
                FormData: 'readonly',
                Blob: 'readonly',
                File: 'readonly',
                FileReader: 'readonly',
                atob: 'readonly',
                btoa: 'readonly',
                // Node globals
                module: 'readonly',
                require: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                Buffer: 'readonly',
                global: 'readonly',
                exports: 'writable',
            },
        },
        plugins: {
            '@typescript-eslint': typescriptEslint,
            'react': reactPlugin,
            'react-hooks': reactHooksPlugin,
        },
        rules: {
            // ESLint recommended rules
            'no-unused-vars': 'off', // Handled by TypeScript
            'no-undef': 'off', // Handled by TypeScript

            // Ban console.log but allow console.warn and console.error
            'no-console': ['error', { allow: ['warn', 'error'] }],

            // TypeScript rules
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-require-imports': 'off',

            // React rules
            'react/react-in-jsx-scope': 'off', // Not needed in React 18+
            'react/prop-types': 'off', // Using TypeScript for prop validation
            'react/jsx-no-target-blank': 'error',

            // React Hooks rules
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    // Build scripts and plugins - allow console.log (CLI output is expected)
    {
        files: ['src/_scripts/**/*.js', 'src/plugins/**/*.js'],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            globals: {
                module: 'readonly',
                require: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                Buffer: 'readonly',
                console: 'readonly',
            },
        },
        rules: {
            'no-console': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
        },
    },
    // Test files - allow console for testing logger functionality
    {
        files: ['**/__tests__/**/*.{js,ts,tsx}', '**/*.test.{js,ts,tsx}', '**/*.spec.{js,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            parser: typescriptParser,
            globals: {
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                jest: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                test: 'readonly',
                console: 'readonly',
            },
        },
        rules: {
            'no-console': 'off',
        },
    },
];

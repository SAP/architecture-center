module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    env: {
        browser: true,
        es2020: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
    ],
    plugins: ['@typescript-eslint', 'react', 'react-hooks'],
    rules: {
        // Ban console.log but allow console.warn and console.error
        'no-console': ['error', { allow: ['warn', 'error'] }],

        // TypeScript rules
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-explicit-any': 'warn',

        // React rules
        'react/react-in-jsx-scope': 'off', // Not needed in React 18+
        'react/prop-types': 'off', // Using TypeScript for prop validation
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    ignorePatterns: [
        'build',
        'node_modules',
        '.docusaurus',
        'static',
        '*.config.js',
        '*.config.ts',
        '.cache',
    ],
};

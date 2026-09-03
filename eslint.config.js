import js from '@eslint/js'
import globals from 'globals';
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';

export default [
    js.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                process: 'readonly',
                React: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            '@typescript-eslint/no-unused-expressions': [
                'error',
                {
                    allowShortCircuit: true,
                    allowTernary: true,
                },
            ],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
        },
    },
    {
        files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
        plugins: {
            'react-hooks': reactHooksPlugin,
        },
        rules: {
            ...reactHooksPlugin.configs.recommended.rules,
        },
    },
    {
        files: ['**/*.{js,jsx,ts,tsx}'], // Match all JS/TS files
        plugins: {
            'react-refresh': reactRefreshPlugin,
        },
        rules: {
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            // Fix and enable separately
            // 'eol-last': ['warn', 'always'],
            // 'no-multiple-empty-lines': ['warn', { max: 1, maxEOF: 0 }],
        },
    },
    {
        files: ['src/utils/ProgressBar.tsx'],
        rules: {
            '@typescript-eslint/no-empty-object-type': 'off',
        },
    },
    {
        files: ['src/generated/**/*.ts'],
        linterOptions: {
            reportUnusedDisableDirectives: false,
        },
    },
    {
        ignores: ['dist', 'src/generated/**', '.eslintrc.cjs'],
    },
];

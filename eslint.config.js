import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ['dist'] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            indent: [1, 4, { SwitchCase: 1 }],
            'function-paren-newline': [0],
            'func-style': [0],
            camelcase: [0],
            'no-loop-func': [0],
            'import/prefer-default-export': [0],
            'no-param-reassign': [0],
            '@typescript-eslint/no-misused-promises': 'off',
            'prefer-destructuring': [0],
            'newline-per-chained-call': [0],
            'max-len': [1, { code: 120 }],
            'no-underscore-dangle': 'off',
            'no-plusplus': [0],
            '@typescript-eslint/class-literal-property-style': [0],
            '@typescript-eslint/member-ordering': [0],
            '@typescript-eslint/no-unused-vars': [0],
            'no-nested-ternary': [0],
            'arrow-parens': [0],
            'no-restricted-syntax': [0],
            'prettier/prettier': [0],
            '@typescript-eslint/prefer-for-of': [0],
            'react/prop-types': [0],
            'array-callback-return': [0],
            'no-else-return': [0],
            'react/no-deprecated': [0],
            semi: ['error'],
            'arrow-body-style': 'off',
            'comma-dangle': 'off',
            '@typescript-eslint/naming-convention': 'off',
            '@typescript-eslint/no-empty-interface': 'off',
            '@typescript-eslint/consistent-type-assertions': 'off',
            'operator-linebreak': 'off',
        },
    }
);

import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.js', '**/*.jsx'],
    plugins: { react },

    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },

    rules: {
      ...js.configs.recommended.rules,
      'indent': ['error', 2, {
        offsetTernaryExpressions: true,
      }],

      'react/jsx-uses-vars': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
    },
  },
]
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'

import ternaryChain from './eslint/eslint-plugin-ternary-chain.js'


export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.js', '**/*.jsx'],
    plugins: {
      react,
      'ternary-chain': ternaryChain
    },

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

      'indent': ['warn', 2, {
        offsetTernaryExpressions: true,
        ignoredNodes: [
          'ConditionalExpression ConditionalExpression'
        ]
      }],

      'no-unused-vars': ['warn', {
        args: 'none',
        ignoreRestSiblings: true,
        caughtErrors: 'none',
      }],

      'react/jsx-uses-vars': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',

      'ternary-chain/align-ternary-chain': 'error',
    },
  },
]
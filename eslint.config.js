import eslint from '@eslint/js'
import jsdoc from 'eslint-plugin-jsdoc'
import perfectionist from 'eslint-plugin-perfectionist'
import globals from 'globals'

export default [
  eslint.configs.recommended,
  jsdoc.configs['flat/recommended'],
  perfectionist.configs['recommended-natural'],
  {
    ignores: ['node_modules/**', 'test/results/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
        ...globals.es2021
      },
      sourceType: 'module'
    },
    rules: {
      eqeqeq: ['error', 'always'],
      'jsdoc/check-indentation': 1,
      'jsdoc/check-line-alignment': 1,
      'jsdoc/require-param-description': 0,
      'jsdoc/require-param-type': 1,
      'jsdoc/require-returns-description': 0,
      'linebreak-style': ['error', 'unix'],
      'no-var': 'error',
      'perfectionist/sort-imports': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index'
          ],
          order: 'asc',
          type: 'natural'
        }
      ],
      'perfectionist/sort-objects': [
        'error',
        {
          order: 'asc',
          type: 'natural'
        }
      ],
      'prefer-const': ['error', { destructuring: 'all' }]
    }
  },
  {
    files: ['test/**/*.js', 'test_*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.mocha
      }
    }
  }
]

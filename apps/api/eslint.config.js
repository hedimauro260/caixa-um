import config from '@caixa1/config/eslint'

export default [
  ...config,
  {
    rules: {
      'no-console': 'off',
    },
  },
]

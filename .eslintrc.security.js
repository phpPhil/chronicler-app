module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  rules: {
    // Security-focused rules
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-alert': 'warn',
    'no-console': 'warn',
    
    // Prevent potential security issues
    'no-unused-vars': 'off', // Let TypeScript handle this
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-undef': 'error',
    'no-global-assign': 'error',
    'no-implicit-globals': 'error',
    
    // Best practices for security
    'strict': ['error', 'never'],
    'no-with': 'error',
    'no-delete-var': 'error'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
const js = require('@eslint/js');
const jestPlugin = require('eslint-plugin-jest');

module.exports = [
  {
    ignores: ['**/*.test.js', '**/*.spec.js', 'coverage/']
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly'
      }
    },
    plugins: {
      jest: jestPlugin
    },
    rules: {
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { 'avoidEscape': true }],
      'no-unused-vars': ['warn'],
      'no-undef': ['error'],
      'no-console': 'off'
    }
  }
];

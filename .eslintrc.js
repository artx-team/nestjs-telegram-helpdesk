module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    // code: 2,
    "@typescript-eslint/member-ordering": "error",
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'allow',
      }
    ],
    "@typescript-eslint/explicit-function-return-type": ["error"],
    '@typescript-eslint/explicit-member-accessibility': ['error', {accessibility: 'no-public'}],
    '@typescript-eslint/indent': ['error', 2, {
      ignoredNodes: [
        'FunctionExpression > .params[decorators.length > 0]',
        'FunctionExpression > .params > :matches(Decorator, :not(:first-child))',
        'ClassBody.body > PropertyDefinition[decorators.length > 0] > .key',
      ]
    }],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-parameter-properties': [
      'error',
      {'allows': ['public', 'private', 'public readonly', 'private readonly']},
    ],
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-useless-constructor': 'off',
    '@typescript-eslint/quotes': ['error', 'single', {allowTemplateLiterals: true}],
    'arrow-parens': ['error', 'as-needed', {requireForBlockBody: false}],
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'always-multiline',
    }],
    'indent': 'off',
    'lines-between-class-members': ['error', 'always'],
    "space-before-blocks": "error",
    'no-useless-constructor': 'off',
    'quotes': 'off',
    'sort-imports': [0, {
      'ignoreCase': false,
      'ignoreMemberSort': false,
      'memberSyntaxSortOrder': ['none', 'all', 'multiple', 'single'],
    }],
    'object-curly-spacing': ['error', 'never'],
    'semi': ['error', 'always'],
    'comma-spacing': ['error', {'before': false, 'after': true}],
    'eol-last': ['error', 'always'],
    'no-trailing-spaces': 'error',
  }
};

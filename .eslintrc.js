module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'import',
  ],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    // code: 2,
    "curly": "error",
    "brace-style": "error",
    "space-infix-ops": "error",
    "arrow-spacing": "error",
    "key-spacing": ["error", { "beforeColon": false }],
    "@typescript-eslint/member-ordering": ["error", {
      "default": {
        "memberTypes": [
          "static-field",
          "public-static-field",
          "protected-static-field",
          "private-static-field",
          "public-static-method",
          "protected-static-method",
          "private-static-method",

          "public-decorated-field",
          "protected-decorated-field",
          "private-decorated-field",
          "public-instance-field",
          "public-abstract-field",
          "protected-instance-field",
          "protected-abstract-field",
          "private-instance-field",

          "public-field",
          "instance-field",
          "protected-field",
          "private-field",
          "abstract-field",
          "constructor",
          "public-method",
          "protected-method",
          "private-method"
        ]
      }
    }],
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'allow',
      }
    ],
    "@typescript-eslint/explicit-function-return-type": ["error"],
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
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'no-public',
        overrides: {
          parameterProperties: 'off'
        }
      }
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
    'keyword-spacing': 'error',
    'eol-last': ['error', 'always'],
    'no-trailing-spaces': 'error',
    'import/no-unresolved': 'off',
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
          caseInsensitive: false,
        },
        groups: [
          'external',
          'builtin',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
      },
    ],
  }
};

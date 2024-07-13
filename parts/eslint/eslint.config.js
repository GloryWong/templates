import antfu from '@antfu/eslint-config'
import perfectionist from 'eslint-plugin-perfectionist'

// https://eslint.vuejs.org/rules/
export default await antfu({
  plugins: {
    perfectionist,
  },
  rules: {
    'no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },
  typescript: {
    overrides: {
      'ts/no-unused-expressions': ['error', {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true,
      }],
    },
  },
})

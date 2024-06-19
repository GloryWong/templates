import antfu from '@antfu/eslint-config'
import perfectionist from 'eslint-plugin-perfectionist'

// https://eslint.vuejs.org/rules/
export default await antfu({
  plugins: {
    perfectionist,
  },
  rules: {
    'no-console': 'off',
  },
})

import { getGitConfigs } from '../utils/getGitConfig.js'
import { definePartConfigs } from './definePartConfigs.js'

export const configs = await definePartConfigs([
  {
    id: 'commitlint',
    packageJsonUpdates: {
      'scripts': {
        prepare: 'pnpm simple-git-hooks',
      },
      'devDependencies': {
        '@commitlint/cli': '^19',
        '@commitlint/config-conventional': '^19',
        'simple-git-hooks': '^2',
      },
      'simple-git-hooks': {
        // eslint-disable-next-line no-template-curly-in-string
        'commit-msg': 'pnpm commitlint --edit ${1}',
      },
    },
  },
  {
    id: 'lintstaged',
    skipTemplate: true,
    packageJsonUpdates: {
      'scripts': {
        'prepare': 'pnpm simple-git-hooks',
        'lint': 'eslint .',
        'lint:fix': 'pnpm lint --fix',
      },
      'devDependencies': {
        'lint-staged': '^15',
        'simple-git-hooks': '^2',
      },
      'simple-git-hooks': {
        'pre-commit': 'pnpm lint-staged',
      },
      'lint-staged': {
        '*': 'pnpm lint:fix',
      },
    },
  },
  {
    id: 'eslint',
    packageJsonUpdates: {
      scripts: {
        'lint': 'eslint .',
        'lint:fix': 'pnpm lint --fix',
      },
      devDependencies: {
        '@antfu/eslint-config': '^2',
        'eslint': '^8',
        'eslint-plugin-perfectionist': '^2',
      },
    },
  },
  {
    id: 'git',
  },
  {
    id: 'github',
    destDir: '.github/workflow',
  },
  {
    id: 'typescript',
    packageJsonUpdates: {
      engines: {
        node: '>=20',
      },
      devDependencies: {
        'typescript': '^5',
        '@tsconfig/node20': '^20',
        'type-fest': 'latest',
      },
    },
  },
  {
    id: 'vscode',
    destDir: '.vscode',
  },
  {
    id: 'npm',
    defaultVariables: async () => {
      const gitDefault = await getGitConfigs({
        userName: 'user.name',
        email: 'user.email',
        url: 'user.url',
      })

      return {
        url: '',
        projectName: '',
        ...gitDefault,
      }
    },
  },
])

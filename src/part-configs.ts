import { getGitConfigs } from './getGitConfig.js'
import { definePartConfigs } from './definePartConfigs.js'

export const partConfigs = definePartConfigs({
  commitlintstaged: {
    destDir: '.',
    packageJsonUpdates: {
      'scripts': {
        'prepare': 'pnpm simple-git-hooks',
        'lint': 'eslint .',
        'lint:fix': 'pnpm lint --fix',
      },
      'devDependencies': {
        '@commitlint/cli': '^19',
        '@commitlint/config-conventional': '^19',
        'lint-staged': '^15',
        'simple-git-hooks': '^2',
      },
      'simple-git-hooks': {
        'pre-commit': 'pnpm lint-staged',
        // eslint-disable-next-line no-template-curly-in-string
        'commit-msg': 'pnpm commitlint --edit ${1}',
      },
      'lint-staged': {
        '*': 'pnpm lint:fix',
      },
    },
  },
  eslint: {
    destDir: '.',
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
  git: {
    destDir: '.',
  },
  github: {
    destDir: './.github/workflow',
  },
  typescript: {
    destDir: '.',
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
  vscode: {
    destDir: './.vscode',
  },
  npm: {
    destDir: '.',
    defaultTemplateVariables: async () => {
      const gitDefault = await getGitConfigs({
        userName: 'user.name',
        email: 'user.email',
      })

      return {
        ...gitDefault,
        url: '',
        projectName: '',
      }
    },
  },
})

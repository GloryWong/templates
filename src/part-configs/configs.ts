import { basename } from 'node:path'
import { cwd } from 'node:process'
import { getGitConfigs } from '../utils/getGitConfig.js'
import { definePartConfigs } from './definePartConfigs.js'

function getGitUser() {
  return getGitConfigs({
    name: 'user.name',
    email: 'user.email',
    url: 'user.url',
  })
}

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
        'eslint': '^9',
      },
    },
  },
  {
    id: 'git',
  },
  {
    id: 'release',
    destDir: '.github',
    srcItems: [{
      id: 'release',
    }, {
      id: 'release-publish',
      variables: {
        shouldPublishNpm: true,
      },
    }],
    suffixNote: 'Required permission: Go to your repository => Settings => Actions => Allow GitHub Actions to create and approve pull requests',
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
        'type-fest': '^4',
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
      return {
        project: {
          name: basename(cwd()),
        },
        user: await getGitUser(),
        pkg: {},
      }
    },
  },
  {
    id: 'renovate',
    suffixNote: 'Go to https://github.com/apps/renovate and Install (or Configure if already installed) Renovate, then add your repository to the Repository access',
  },
  {
    id: 'readme',
    defaultVariables: async () => {
      return {
        project: {
          name: basename(cwd()),
        },
        user: await getGitUser(),
      }
    },
  },
  {
    id: 'test',
    packageJsonUpdates: {
      'test': 'vitest run',
      'test:watch': 'vitest',
      'coverage': 'vitest run --coverage.enabled',
      'devDependencies': {
        '@vitest/coverage-istanbul': '^2',
        'vitest': '^2',
      },
    },
  },
])

import { getGitConfigs } from './getGitConfig.js'
import { definePartConfigs } from './definePartConfigs.js'

export const partConfigs = definePartConfigs({
  commitlint: {
    destDir: '.',
  },
  eslint: {
    destDir: '.',
    packageJsonUpdates: {
      devDependencies: {
        eslint: '^8',
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
      devDependencies: {
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

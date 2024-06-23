import { getGitConfigs } from './getGitConfig.js'
import type { TemplateVariables } from './types.js'

interface PartConfig {
  /**
   * The destination directory.
   * Relative to process.cwd()
   */
  dir: string
  defaultTemplateVariables?: TemplateVariables | (() => TemplateVariables | Promise<TemplateVariables>)
}

export const PARTS_INFO: Readonly<Record<string, PartConfig>> = {
  commitlint: {
    dir: '.',
  },
  eslint: {
    dir: '.',
  },
  git: {
    dir: '.',
  },
  github: {
    dir: './.github/workflow',
  },
  typescript: {
    dir: '.',
  },
  vscode: {
    dir: './.vscode',
  },
  npm: {
    dir: '.',
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
}

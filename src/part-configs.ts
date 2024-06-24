import { getGitConfigs } from './getGitConfig.js'
import type { TemplateVariables } from './types.js'

interface PartConfig {
  /**
   * The destination directory.
   * Relative to process.cwd()
   */
  destDir: string
  defaultTemplateVariables?: TemplateVariables | (() => TemplateVariables | Promise<TemplateVariables>)
}

export const PART_CONFIGS: Readonly<Record<string, PartConfig>> = {
  commitlint: {
    destDir: '.',
  },
  eslint: {
    destDir: '.',
  },
  git: {
    destDir: '.',
  },
  github: {
    destDir: './.github/workflow',
  },
  typescript: {
    destDir: '.',
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
}

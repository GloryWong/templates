import { join } from 'node:path'
import { readdir } from 'node:fs/promises'
import { downloadTemplate } from 'giget'
import { updatePackage } from 'write-package'
import { getTmpPath } from './utils/getTmpPath.js'
import { deleteTmp } from './utils/deleteTmp.js'
import type { CopyTemplateOptions } from './copyTemplate.js'
import { copyTemplate } from './copyTemplate.js'
import { TEMPLATE_DOWNLOAD_DIR } from './constants.js'
import { configs } from './part-configs/index.js'
import { installDeps } from './installDeps.js'

export interface ApplyPartTemplateOptions extends CopyTemplateOptions {
  /**
   * if install node package dependencies
   * @default false
   */
  install?: boolean
}

export async function applyPartTemplate(partId: string, options: ApplyPartTemplateOptions = {}) {
  try {
    const config = configs.get(partId)

    if (!config)
      throw new Error(`Invalid partId`)

    const { force, merge, variables, install = false } = options

    if (!config.skipTemplate) {
      // Download parts to tmp
      const tmp = await getTmpPath(TEMPLATE_DOWNLOAD_DIR)
      const { source, dir } = await downloadTemplate(config.src, {
        dir: join(tmp, partId),
      })
      if (!(await readdir(dir)).length)
        throw new Error(`Failed to download template from ${source}`)

      // Copy tmp to destination
      await copyTemplate(dir, config.destDir, {
        force,
        merge,
        variables: {
          ...config.defaultVariables,
          ...variables,
        },
      })
    }

    // Update package json
    const { packageJsonUpdates } = config
    if (packageJsonUpdates) {
      await updatePackage(packageJsonUpdates)
    }

    await deleteTmp(TEMPLATE_DOWNLOAD_DIR)

    console.log('Applied part template \'%s\' successfully!', partId)
    // Install dependencies
    if (install) {
      await installDeps(config)
    }
  }
  catch (error: any) {
    throw new Error(`Failed to apply part template \'${partId}\'. Reason: ${error.message}`)
  }
}

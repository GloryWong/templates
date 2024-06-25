import { join } from 'node:path'
import { readdir } from 'node:fs/promises'
import { downloadTemplate } from 'giget'
import { updatePackage } from 'write-package'
import { getTmpPath } from './utils/getTmpPath.js'
import { deleteTmp } from './utils/deleteTmp.js'
import type { CopyTemplateOptions } from './copyTemplate.js'
import { copyTemplate } from './copyTemplate.js'
import { PART_TEMPLATE_LOCATION, TEMPLATE_DOWNLOAD_DIR } from './constants.js'
import { getPartConfig, getPartConfigDefaultTemplateVariables } from './part-configs/index.js'

export type ApplyPartTemplateOptions = CopyTemplateOptions

export async function applyPartTemplate(partName: string, options: ApplyPartTemplateOptions = {}) {
  try {
    const config = getPartConfig(partName)

    if (!config)
      throw new Error(`Invalid partName`)

    const { force, merge, variables } = options

    // Download parts to tmp
    const tmp = await getTmpPath(TEMPLATE_DOWNLOAD_DIR)
    const { source, dir } = await downloadTemplate(`${PART_TEMPLATE_LOCATION}/${partName}#master`, {
      dir: join(tmp, partName),
    })
    if (!(await readdir(dir)).length)
      throw new Error(`Failed to download template from ${source}`)

    // Copy tmp to destination
    await copyTemplate(dir, config.destDir, {
      force,
      merge,
      variables: {
        ...(await getPartConfigDefaultTemplateVariables(partName)),
        ...variables,
      },
    })

    // Update package json
    const { packageJsonUpdates } = config
    if (packageJsonUpdates) {
      await updatePackage(packageJsonUpdates)
    }

    await deleteTmp(TEMPLATE_DOWNLOAD_DIR)
    console.log('Applied part template \'%s\' successfully! Finished.', partName)
  }
  catch (error: any) {
    throw new Error(`Failed to apply part template \'${partName}\'. Reason: ${error.message}`)
  }
}

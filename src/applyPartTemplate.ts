import { join } from 'node:path'
import { readdir } from 'node:fs/promises'
import { downloadTemplate } from 'giget'
import { PART_CONFIGS } from './part-configs.js'
import { getTmpPath } from './getTmpPath.js'
import { deleteTmp } from './deleteTmp.js'
import type { CopyTemplateOptions } from './copyTemplate.js'
import { copyTemplate } from './copyTemplate.js'
import { isValidPartName } from './isValidPartName.js'

function getPartInfoDefaultTemplateVariables(partName: string) {
  const { defaultTemplateVariables } = PART_CONFIGS[partName]
  if (!defaultTemplateVariables)
    return {}
  if (typeof defaultTemplateVariables === 'function') {
    return defaultTemplateVariables()
  }

  return defaultTemplateVariables
}

export type ApplyPartTemplateOptions = CopyTemplateOptions

export async function applyPartTemplate(partName: string, options: ApplyPartTemplateOptions = {}) {
  try {
    if (!isValidPartName(partName))
      throw new Error(`Invalid partName`)

    const { force, merge, variables } = options
    const location = `github:GloryWong/templates/parts/${partName}#master`

    // Download parts to tmp
    const tmp = await getTmpPath('downloads')
    const { source, dir } = await downloadTemplate(location, {
      dir: join(tmp, partName),
    })
    if (!(await readdir(dir)).length)
      throw new Error(`Failed to download template from ${source}`)

    // Copy tmp to destination
    await copyTemplate(dir, PART_CONFIGS[partName].dir, {
      force,
      merge,
      variables: {
        ...(await getPartInfoDefaultTemplateVariables(partName)),
        ...variables,
      },
    })
    await deleteTmp('downloads')
    console.log('Applied part template \'%s\' successfully! Finished.', partName)
  }
  catch (error: any) {
    throw new Error(`Failed to apply part template \'${partName}\'. Reason: ${error.message}`)
  }
}

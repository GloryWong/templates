import { EOL } from 'node:os'
import { outputJSON, readJSON } from 'fs-extra/esm'
import { backUpFile } from './backUpFile.js'
import { mergeDedup } from './mergeDedup.js'

interface MergeJsonFilesOptions {
  backUp?: boolean
  backupDestDir?: string
}

export async function mergeJsonFiles(srcFilePath: string, destFilePath: string, options: MergeJsonFilesOptions = {}) {
  if (!srcFilePath.endsWith('.json') || !destFilePath.endsWith('.json'))
    return false

  const { backUp = false, backupDestDir } = options

  try {
    backUp && await backUpFile(destFilePath, backupDestDir)
    const srcContent = await readJSON(srcFilePath)
    const destContent = await readJSON(destFilePath)
    const result = mergeDedup(destContent, srcContent)

    await outputJSON(destFilePath, result, {
      spaces: 2,
      EOL,
    })
    return true
  }
  catch {
    return false
  }
}

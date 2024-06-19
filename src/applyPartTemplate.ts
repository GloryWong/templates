import { join } from 'node:path'
import { readdir } from 'node:fs/promises'
import type { PathLike } from 'node:fs'
import { downloadTemplate } from 'giget'
import { copy } from 'fs-extra'
import { PARTS_INFO, type PartName } from './constants.js'
import { backUpFile } from './backUpFile.js'
import { getTmpPath } from './getTmpPath.js'
import { deleteTmp } from './deleteTmp.js'

export async function whichPartFilesExist(name: PartName, tmpPartDir: PathLike) {
  const { dir } = PARTS_INFO[name]

  const localPartFiles = await readdir(dir)
  const tmpPartFiles = await readdir(tmpPartDir)

  const existingFiles: string[] = []
  const nonexistingFiles: string[] = []

  tmpPartFiles.forEach((lf) => {
    if (localPartFiles.includes(lf))
      existingFiles.push(lf)
    else
      nonexistingFiles.push(lf)
  })

  return {
    existingFiles,
    nonexistingFiles,
  }
}

export interface ApplyPartTemplateOptions {
  /**
   * Overwrite existing files
   * @default false
   */
  force?: boolean
}

export async function applyPartTemplate(name: PartName, options: ApplyPartTemplateOptions = {}) {
  try {
    const { force = false } = options
    const location = `github:GloryWong/templates/parts/${name}#master`

    // Download parts to tmp
    const tmp = await getTmpPath('downloads')
    const { source, dir } = await downloadTemplate(location, {
      dir: join(tmp, name),
    })
    if (!(await readdir(dir)).length)
      throw new Error(`Failed to download template from ${source}`)

    // Back up existing files in destination
    const { existingFiles } = await whichPartFilesExist(name, dir)
    if (force && existingFiles.length) {
      console.log('Overwrite %d file(s).', existingFiles.length)

      for (let index = 0; index < existingFiles.length; index++) {
        const fileName = existingFiles[index]
        const backup = await backUpFile(join(PARTS_INFO[name].dir, fileName))
        console.log('Original \'%s\' is backed up to %s', fileName, backup)
      }
    }
    else if (existingFiles.length) {
      throw new Error(`File '${existingFiles.join(', ')}' already exists in destination. Your can use '--force' to overwrite.`)
    }

    // Copy tmp to destination
    await copy(dir, PARTS_INFO[name].dir)
    await deleteTmp('downloads')
    console.log('Applied part template \'%s\' successfully! Finished.', name)
  }
  catch (error) {
    throw new Error(`Failed to apply part template \'${name}\'. Error: ${error}`)
  }
}

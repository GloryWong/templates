import { basename, join } from 'node:path'
import { readdir, stat } from 'node:fs/promises'
import type { CopyOptions } from 'fs-extra/esm'
import { copy, ensureDir, ensureFile, pathExists } from 'fs-extra/esm'
import type { TemplateVariables } from './types.js'
import { listDirFiles } from './utils/listDirFiles.js'
import { backUpFile } from './utils/backUpFile.js'
import { mergeJsonFiles } from './utils/mergeJsonFiles.js'
import { assignTemplateVariables } from './assignTemplateVariables.js'

export interface CopyTemplateOptions extends CopyOptions {
  /**
   * Variables used in templates
   */
  variables?: TemplateVariables
  /**
   * Overwrite existing files
   * @default false
   */
  force?: boolean
  /**
   * merge to existing destination files. **Support only JSON file**.
   * @default false
   */
  merge?: boolean
}

async function whichDestFilesExist(srcPath: string, destPath: string, pathIsFile: boolean) {
  const srcFiles = pathIsFile ? [basename(srcPath)] : await readdir(srcPath)
  const destFiles = pathIsFile ? [basename(destPath)] : await readdir(destPath)

  const existingFiles: string[] = []
  const nonexistingFiles: string[] = []

  srcFiles.forEach((lf) => {
    if (destFiles.includes(lf))
      existingFiles.push(lf)
    else
      nonexistingFiles.push(lf)
  })

  return {
    existingFiles,
    nonexistingFiles,
  }
}

async function backupFiles(fileNames: string[], path: string, pathIsFile: boolean) {
  for (let index = 0; index < fileNames.length; index++) {
    const fileName = fileNames[index]
    await backUpFile(pathIsFile ? path : join(path, fileName))
  }
}

async function copyFiles(srcPath: string, destPath: string, fileNames: string[], pathIsFile: boolean, backUp = false) {
  backUp && await backupFiles(fileNames, destPath, pathIsFile)
  if (pathIsFile) {
    await copy(srcPath, destPath)
  }
  else {
    for (let index = 0; index < fileNames.length; index++) {
      const fileName = fileNames[index]
      await copy(join(srcPath, fileName), join(destPath, fileName))
    }
  }
}

async function mergeFiles(srcPath: string, destPath: string, fileNames: string[], pathIsFile: boolean) {
  const mergedFileNames = []
  const nonMergedFileNames = []
  if (pathIsFile) {
    if (!(await mergeJsonFiles(srcPath, destPath, { backUp: true }))) {
      nonMergedFileNames.push(fileNames[0])
    }
    else {
      mergedFileNames.push(fileNames[0])
    }
  }
  else {
    for (let index = 0; index < fileNames.length; index++) {
      const fileName = fileNames[index]
      if (!(await mergeJsonFiles(join(srcPath, fileName), join(destPath, fileName), { backUp: true }))) {
        nonMergedFileNames.push(fileName)
      }
      else {
        mergedFileNames.push(fileName)
      }
    }
  }

  return {
    mergedFileNames,
    nonMergedFileNames,
  }
}

/**
 * Note: variables are only assigned for first level files now
 */
export async function copyTemplate(srcPath: string, destPath: string, options: CopyTemplateOptions = {}) {
  const { variables, force = false, merge = false } = options

  try {
    if (!(await pathExists(srcPath)))
      throw new Error(`${srcPath} does not exist`)

    const srcPathIsFile = (await stat(srcPath)).isFile()
    if (srcPathIsFile)
      await ensureFile(destPath)
    else
      await ensureDir(destPath)
    const destPathIsFile = (await stat(destPath)).isFile()

    if ((!srcPathIsFile && destPathIsFile) || (srcPathIsFile && !destPathIsFile))
      throw new Error('srcPath and destPath should be either both files or both directories')

    // Assign variables to src
    if (variables) {
      // use variable for the src file
      if (srcPathIsFile) {
        await assignTemplateVariables(srcPath, variables)
      }
      else {
        // use variables for files in src dir
        const fileNames = await listDirFiles(srcPath)
        for (let index = 0; index < fileNames.length; index++) {
          const fileName = fileNames[index]
          const filePath = join(srcPath, fileName)
          await assignTemplateVariables(filePath, variables)
        }
      }
    }

    const { existingFiles, nonexistingFiles } = await whichDestFilesExist(srcPath, destPath, destPathIsFile)

    if (existingFiles.length) {
      if (merge) {
        const { mergedFileNames, nonMergedFileNames } = await mergeFiles(srcPath, destPath, existingFiles, destPathIsFile)
        mergedFileNames.length && console.log('Merged %s existing files %s.', mergedFileNames.length, mergedFileNames.join(', '))
        nonMergedFileNames.length && console.log('%s existing files %s cannot be merged. Skipped.', nonMergedFileNames.length, nonMergedFileNames.join(', '))

        if (force && nonMergedFileNames.length) {
          await copyFiles(srcPath, destPath, nonMergedFileNames, destPathIsFile, true)
          console.log('Overwrote %d existing files %s', nonMergedFileNames.length, nonMergedFileNames.join(', '))
        }
      }
      else if (force) {
        await copyFiles(srcPath, destPath, existingFiles, destPathIsFile, true)
        console.log('Overwrote %d existing files %s', existingFiles.length, existingFiles.join(', '))
      }
      else {
        console.log('Skipped %d existing files %s', existingFiles.length, existingFiles.join(', '))
      }
    }

    if (nonexistingFiles.length) {
      await copyFiles(srcPath, destPath, nonexistingFiles, destPathIsFile)
      console.log('Copied %d files %s', nonexistingFiles.length, nonexistingFiles.join(', '))
    }
  }
  catch (error) {
    throw new Error(`Failed to copy template. ${String(error)}`)
  }
}

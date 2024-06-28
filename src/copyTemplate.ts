import { basename, join } from 'node:path'
import { readdir, stat } from 'node:fs/promises'
import type { CopyOptions } from 'fs-extra/esm'
import { copy, ensureDir, ensureFile, pathExists } from 'fs-extra/esm'
import type { TemplateVariables } from './types.js'
import { listDirFiles } from './utils/listDirFiles.js'
import { backUpFile } from './utils/backUpFile.js'
import { mergeJsonFiles } from './utils/mergeJsonFiles.js'
import { assignTemplateVariables } from './assignTemplateVariables.js'
import { logger } from './utils/logger.js'

const log = logger('copyTemplate')

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
  log.info('Checking existing files in workspace')

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

  log.info('Existing files %o', existingFiles)

  return {
    existingFiles,
    nonexistingFiles,
  }
}

async function backupFiles(fileNames: string[], path: string, pathIsFile: boolean) {
  log.info('Backing up files %o', fileNames)
  for (let index = 0; index < fileNames.length; index++) {
    const fileName = fileNames[index]
    await backUpFile(pathIsFile ? path : join(path, fileName))
  }
  log.info('Backed up files %o', fileNames)
}

async function copyFiles(srcPath: string, destPath: string, fileNames: string[], pathIsFile: boolean, backUp = false) {
  log.info('Copying files %o from %s to %s', fileNames, srcPath, destPath)
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
  log.info('Copied files %o', fileNames)
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
      log.info('Assigning template variables... %o', variables)
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
      log.info('Assigned template variables')
    }

    const { existingFiles, nonexistingFiles } = await whichDestFilesExist(srcPath, destPath, destPathIsFile)

    if (existingFiles.length) {
      if (merge) {
        const { mergedFileNames, nonMergedFileNames } = await mergeFiles(srcPath, destPath, existingFiles, destPathIsFile)
        mergedFileNames.length && log.warn('Merged %s existing files %o.', mergedFileNames.length, mergedFileNames)
        nonMergedFileNames.length && log.info('%s existing files %o cannot be merged. Skipped.', nonMergedFileNames.length, nonMergedFileNames)

        if (force && nonMergedFileNames.length) {
          await copyFiles(srcPath, destPath, nonMergedFileNames, destPathIsFile, true)
          log.warn('Overwrote %d existing files %o', nonMergedFileNames.length, nonMergedFileNames)
        }
      }
      else if (force) {
        await copyFiles(srcPath, destPath, existingFiles, destPathIsFile, true)
        log.warn('Overwrote %d existing files %o', existingFiles.length, existingFiles)
      }
      else {
        log.info('Skipped %d existing files %o', existingFiles.length, existingFiles)
      }
    }

    if (nonexistingFiles.length) {
      await copyFiles(srcPath, destPath, nonexistingFiles, destPathIsFile)
      log.info('Copied %d files %o', nonexistingFiles.length, nonexistingFiles)
    }
  }
  catch (error) {
    throw new Error(`Failed to copy template. ${String(error)}`)
  }
}

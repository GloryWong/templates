/* eslint-disable no-console */
import { join } from 'node:path'
import { readdir } from 'node:fs/promises'
import process from 'node:process'
import { downloadTemplate } from 'giget'
import { updatePackage } from 'write-package'
import ora from 'ora'
import { enableLogger } from '@gloxy/logger'
import { confirm } from '@inquirer/prompts'
import chalk from 'chalk'
import { readPackage } from 'read-pkg'
import picomatch from 'picomatch'
import { getTmpPath } from './utils/getTmpPath.js'
import { deleteTmp } from './utils/deleteTmp.js'
import type { CopyTemplateOptions } from './copyTemplate.js'
import { copyTemplate } from './copyTemplate.js'
import { TEMPLATE_DOWNLOAD_DIR } from './constants.js'
import { configs } from './part-configs/index.js'
import { installPackageDeps } from './utils/installPackageDeps.js'
import { logger } from './utils/logger.js'
import { extractPackageDeps } from './utils/extractPackageDeps.js'

export interface ApplyPartTemplateOptions extends CopyTemplateOptions {
  /**
   * install node package dependencies
   * @default false
   */
  install?: boolean
  /**
   * When `install` is set to false, a prompt will show to users to confirm whether install dependencies,
   * this option can skip installation
   * @default false
   */
  skipInstall?: boolean
  /**
   * display verbose logs
   * @default false
   */
  verbose?: boolean
}

/**
 * @param partId Part template id. Must not contains any whitespaces.
 * @param srcItemId (optional) SrcItem id. Must not contains any whitespaces.
 * @param options (optional)
 */
export async function applyPartTemplate(partId: string, srcItemId?: string, options: ApplyPartTemplateOptions = {}) {
  try {
    if (/\s/.test(partId))
      throw new Error(`Invalid partId ${partId}. Whitespace is not allowed`)

    const config = configs.get(partId)
    if (!config)
      throw new Error(`Invalid partId ${partId}. Respective config does not exist`)

    let srcItem: Required<(typeof config)>['srcItems'][number] | undefined
    if (srcItemId) {
      if (/\s/.test(srcItemId))
        throw new Error(`Invalid srcItemId ${srcItemId}. Whitespace is not allowed`)
      srcItem = config.srcItems?.find(v => v.id === srcItemId)
      if (!srcItem)
        throw new Error(`Invalid srcItemId ${srcItemId}. Respective srcItem does not exist in its config`)
    }

    const { variables, install = false, skipInstall = false, verbose = false } = options
    const log = logger('applyPartTemplate')
    if (verbose) {
      enableLogger('templates:*')
    }
    const spinner = ora({
      isSilent: process.env.NODE_ENV === 'test' || verbose,
    })

    config.skipTemplate && log.info('Skip template download and copy. %s', partId)
    if (!config.skipTemplate) {
      // Download parts to tmp
      log.info('Downloading template from %s', config.src)
      spinner.start('Downloading template...')
      const tmp = await getTmpPath(TEMPLATE_DOWNLOAD_DIR)
      const { source, dir } = await downloadTemplate(config.src, {
        dir: join(tmp, partId),
      })
      if (!(await readdir(dir)).length) {
        spinner.fail('Failed to download template')
        throw new Error(`Failed to download template from ${source}`)
      }

      spinner.succeed('Downloaded template')
      log.info('Downloaded template to %s', dir)

      // Create filter
      let fileFilter = (src: string) => true
      if (srcItem) {
        const { id, include, exclude } = srcItem
        const includePattern = (include ? Array.isArray(include) ? include : [include] : ['**']).map(v => join(dir, v))
        const excludePattern = exclude ? (Array.isArray(exclude) ? exclude : [exclude]).map(v => join(dir, v)) : []
        log.debug('Created glob patterns for file filter. Include: %o. Exclude: %o', includePattern, excludePattern)
        const isMatch = picomatch(includePattern, {
          ignore: excludePattern,
        })
        fileFilter = (src: string) => isMatch(src)
      }

      // Copy tmp to destination
      log.info('Copying template to %s', config.destDir)
      spinner.start('Copying template...')
      const existingFilesHandle = await copyTemplate(dir, config.destDir, {
        variables: {
          ...config.defaultVariables,
          ...variables,
        },
        filter: fileFilter,
      })

      switch (existingFilesHandle) {
        case 'merged':
          spinner.warn('Copied template. Some existing files are merged')
          break
        case 'overwrote-merged':
          spinner.warn('Copied template. Some existing files are merged or overwritten')
          break
        case 'overwrote':
          spinner.warn('Copied template. Some existing files are overwritten')
          break
        case 'none':
        default:
          spinner.succeed('Copied template')
      }
      log.info('Copied template for partId %s', partId)
    }

    // Update package json
    const { packageJsonUpdates } = config
    const localPackageJson = await readPackage().catch(() => ({}))
    if (packageJsonUpdates) {
      log.info('Updating package json for partId %s', partId)
      spinner.start('Updating package.json...')
      await updatePackage(packageJsonUpdates)
      spinner.succeed('Updated package.json')
      log.info('Updated package json for partId %s', partId)
    }

    log.info('Applied part template \'%s\' successfully!', partId)
    config.suffixNote && console.log(chalk.yellow(`Note: ${config.suffixNote}`))

    log.info('Clear downloaded template for partId %s', partId)
    await deleteTmp(TEMPLATE_DOWNLOAD_DIR)

    // Install dependencies

    if (skipInstall)
      return

    const { count, ...deps } = await extractPackageDeps(packageJsonUpdates, localPackageJson)
    if (count === 0)
      return

    if (install || await confirm({ message: 'New package dependencies are added. Install them?' })) {
      try {
        log.info('Installing dependencies for partId %s', partId)
        spinner.start('Installing dependencies...')
        await installPackageDeps(...Object.values(deps))
        spinner.succeed('Installed dependencies')
        log.info('Installed dependencies for partId %s', partId)
      }
      catch {
        spinner.warn('Failed to install dependencies')
        log.error('Failed to install dependencies for partId %s', partId)
      }
    }
  }
  catch (error: any) {
    throw new Error(`Failed to apply part template \'${partId}\'. Reason: ${error.message}`)
  }
}

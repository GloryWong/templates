import { join } from 'node:path'
import { readdir } from 'node:fs/promises'
import process from 'node:process'
import { downloadTemplate } from 'giget'
import { updatePackage } from 'write-package'
import ora from 'ora'
import { enableLogger } from '@gloxy/logger'
import { getTmpPath } from './utils/getTmpPath.js'
import { deleteTmp } from './utils/deleteTmp.js'
import type { CopyTemplateOptions } from './copyTemplate.js'
import { copyTemplate } from './copyTemplate.js'
import { TEMPLATE_DOWNLOAD_DIR } from './constants.js'
import { configs } from './part-configs/index.js'
import { installDeps } from './installDeps.js'
import { logger } from './utils/logger.js'

export interface ApplyPartTemplateOptions extends CopyTemplateOptions {
  /**
   * install node package dependencies
   * @default false
   */
  install?: boolean
  /**
   * display verbose logs
   * @default false
   */
  verbose?: boolean
}

export async function applyPartTemplate(partId: string, options: ApplyPartTemplateOptions = {}) {
  try {
    const config = configs.get(partId)
    if (!config)
      throw new Error(`Invalid partId`)

    const { force, merge, variables, install = false, verbose = false } = options
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

      // Copy tmp to destination
      log.info('Copying template to %s', config.destDir)
      spinner.start('Copying template...')
      await copyTemplate(dir, config.destDir, {
        force,
        merge,
        variables: {
          ...config.defaultVariables,
          ...variables,
        },
      })
      spinner.succeed('Copied template')
      log.info('Copied template for partId %s', partId)
    }

    // Update package json
    const { packageJsonUpdates } = config
    if (packageJsonUpdates) {
      log.info('Updating package json for partId %s', partId)
      spinner.start('Updating package.json...')
      await updatePackage(packageJsonUpdates)
      spinner.succeed('Updated package.json')
      log.info('Updated package json for partId %s', partId)
    }

    log.info('Clear downloaded template for partId %s', partId)
    await deleteTmp(TEMPLATE_DOWNLOAD_DIR)

    log.info('Applied part template \'%s\' successfully!', partId)
    // Install dependencies
    if (install) {
      try {
        log.info('Installing dependencies for partId %s', partId)
        spinner.start('Installing dependencies...')
        await installDeps(config.packageJsonUpdates ?? {})
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

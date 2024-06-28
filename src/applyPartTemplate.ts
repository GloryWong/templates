import { join } from 'node:path'
import { readdir } from 'node:fs/promises'
import { downloadTemplate } from 'giget'
import { updatePackage } from 'write-package'
import ora from 'ora'
import { isLoggerEnabled } from '@gloxy/logger'
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
    const log = logger('applyPartTemplate')
    const spinner = ora({
      isSilent: isLoggerEnabled('templates:*'),
    })

    config.skipTemplate && log.debug('Skip template download and copy. %s', partId)
    if (!config.skipTemplate) {
      // Download parts to tmp
      log.debug('Downloading template from %s', config.src)
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
      log.debug('Downloaded template to %s', dir)

      // Copy tmp to destination
      log.debug('Copying template to %s', config.destDir)
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
      log.debug('Copied template. %s', partId)
    }

    // Update package json
    const { packageJsonUpdates } = config
    if (packageJsonUpdates) {
      log.debug('Updating package json. %s', partId)
      spinner.start('Updating package.json...')
      await updatePackage(packageJsonUpdates)
      spinner.succeed('Updated package.json')
      log.debug('Updated package json. %s', partId)
    }

    log.debug('Clear downloaded template. %s', partId)
    await deleteTmp(TEMPLATE_DOWNLOAD_DIR)

    log.debug('Applied part template \'%s\' successfully!', partId)
    // Install dependencies
    if (install) {
      log.debug('Installing dependencies. %s', partId)
      spinner.start('Installing dependencies...')
      await installDeps(config)
      spinner.succeed('Installed dependencies')
      log.debug('Installed dependencies. %s', partId)
    }
  }
  catch (error: any) {
    throw new Error(`Failed to apply part template \'${partId}\'. Reason: ${error.message}`)
  }
}

/* eslint-disable no-console */
import { EOL } from 'node:os'
import process from 'node:process'
import chalk from 'chalk'
import merge from 'deepmerge'
import type { PackageJson } from 'type-fest'
import ora from 'ora'
import { enableLogger } from '@gloxy/logger'
import { type ApplyPartTemplateOptions, applyPartTemplate } from './applyPartTemplate.js'
import { configs } from './part-configs/configs.js'
import { installDeps } from './installDeps.js'
import { logger } from './utils/logger.js'

async function installMultiPartDeps(partIds: string[]) {
  const packageJsonUpdates = partIds.reduce<PackageJson>((pre, partId) => {
    const packageJsonUpdates = configs.get(partId)?.packageJsonUpdates
    return packageJsonUpdates ? merge(pre, packageJsonUpdates) : pre
  }, {})

  await installDeps(packageJsonUpdates)
}

export async function applyPartTemplates(partIds: string[], options: ApplyPartTemplateOptions = {}) {
  const successfulPartIds: string[] = []
  const failedParts: {
    id: string
    error: string
  }[] = []

  if (partIds.length === 1) {
    await applyPartTemplate(partIds[0], options)
  }
  else {
    const { install = false, verbose = false } = options

    for (let index = 0; index < partIds.length; index++) {
      const partId = partIds[index]
      process.env.NODE_ENV !== 'test' && console.log(chalk.blue('[%s]'), partId)
      try {
        await applyPartTemplate(partId, { ...options, install: false })
        successfulPartIds.push(partId)
        process.env.NODE_ENV !== 'test' && console.log(chalk.green('Apply %s successfully%s'), partId, EOL)
      }
      catch (error) {
        process.env.NODE_ENV !== 'test' && console.error(chalk.red('Failed to apply %s%s'), String(error), EOL)
        failedParts.push({ id: partId, error: String(error) })
      }
    }

    // Install deps
    if (install) {
      const log = logger('applyPartTemplates')
      if (verbose) {
        enableLogger('templates:*')
      }
      const spinner = ora({
        isSilent: process.env.NODE_ENV === 'test' || verbose,
      })

      spinner.start('Installing dependencies...')
      log.info('Installing dependencies...')
      try {
        await installMultiPartDeps(partIds)
        spinner.succeed('Installed dependencies')
        log.info('Installed dependencies')
      }
      catch {
        spinner.warn('Failed to install dependencies. Manually install them using `pnpm update`.')
        log.error('Failed to install dependencies')
      }
    }

    process.env.NODE_ENV !== 'test' && console.log('Success(%d), Failed(%d)', successfulPartIds.length, failedParts.length)
  }

  return failedParts
}

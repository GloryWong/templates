/* eslint-disable no-console */
import { EOL } from 'node:os'
import process from 'node:process'
import chalk from 'chalk'
import merge from 'deepmerge'
import type { PackageJson } from 'type-fest'
import ora from 'ora'
import { enableLogger } from '@gloxy/logger'
import { confirm } from '@inquirer/prompts'
import { type ApplyPartTemplateOptions, applyPartTemplate } from './applyPartTemplate.js'
import { configs } from './part-configs/configs.js'
import { logger } from './utils/logger.js'
import { extractPackageDeps } from './utils/extractPackageDeps.js'
import { installPackageDeps } from './utils/installPackageDeps.js'

function extractMultiPartDeps(partIds: string[]) {
  const packageJsonUpdates = partIds.reduce<PackageJson>((pre, partId) => {
    const packageJsonUpdates = configs.get(partId)?.packageJsonUpdates
    return packageJsonUpdates ? merge(pre, packageJsonUpdates) : pre
  }, {})

  return extractPackageDeps(packageJsonUpdates)
}

export async function applyPartTemplates(partIds: string[], options: ApplyPartTemplateOptions = {}) {
  const successfulPartIds: string[] = []
  const failedParts: {
    id: string
    error: string
  }[] = []

  console.log()
  if (partIds.length === 1) {
    await applyPartTemplate(partIds[0], options)
  }
  else {
    const { install = false, verbose = false } = options

    for (let index = 0; index < partIds.length; index++) {
      const partId = partIds[index]
      process.env.NODE_ENV !== 'test' && console.log(chalk.blue('[%s]'), partId)
      try {
        await applyPartTemplate(partId, { ...options, skipInstall: true })
        successfulPartIds.push(partId)
        process.env.NODE_ENV !== 'test' && console.log(chalk.green('Apply %s successfully%s'), partId, EOL)
      }
      catch (error) {
        process.env.NODE_ENV !== 'test' && console.error(chalk.red('Failed to apply %s%s'), String(error), EOL)
        failedParts.push({ id: partId, error: String(error) })
      }
    }

    // Install deps
    const { count, ...deps } = await extractMultiPartDeps(partIds)
    if (count > 0) {
      if (install || await confirm({ message: 'New package dependencies are added. Install them?' })) {
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
          await installPackageDeps(...Object.values(deps))
          spinner.succeed('Installed dependencies')
          log.info('Installed dependencies')
        }
        catch {
          spinner.warn('Failed to install dependencies. Manually install them using `pnpm update`.')
          log.error('Failed to install dependencies')
        }
        console.log()
      }
    }

    process.env.NODE_ENV !== 'test' && console.log('Success(%d), Failed(%d)', successfulPartIds.length, failedParts.length)
  }

  return failedParts
}

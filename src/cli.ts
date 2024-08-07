#!/usr/bin/env node

import { join } from 'node:path'
import process from 'node:process'
import { readdir } from 'node:fs/promises'
import { Argument, program } from 'commander'
import { readPackage } from 'read-pkg'
import { enableLogger } from '@gloxy/logger'
import ora from 'ora'
import { checkbox, confirm } from '@inquirer/prompts'
import { ids } from './part-configs/index.js'
import { logger } from './utils/logger.js'
import { isDirUnderGitControl } from './utils/isDirUnderGitControl.js'
import { isGitInstalled } from './utils/isGitInstalled.js'
import { checkGitClean } from './utils/checkGitClean.js'
import { applyPartTemplates } from './applyPartTemplates.js'

const version = (await readPackage({ cwd: join(import.meta.dirname, '..') })).version

program
  .name('tmpl')
  .version(version)

program.command('apply')
  .alias('part')
  .description('Apply one or more part templates. Part templates are applied to the current working directory.')
  .addArgument(new Argument('[part-id...]', 'part template id.').choices(ids))
  .option('--install', 'install package dependencies after part templates are applied')
  .option('-v, --verbose', 'display verbose logs')
  .showHelpAfterError(true)
  .action(async (partIds: string[], options, command) => {
    if (options.verbose) {
      enableLogger('templates:*')
    }
    const log = logger('CLI')
    log.debug('Command: %s, arg: %s, options: %o', command.name(), partIds, options)

    log.info('Check if current working directory is git clean')
    const spinner = ora({
      isSilent: process.env.NODE_ENV === 'test' || options.verbose,
    })
    spinner.start('Checking Git...')
    if (await isGitInstalled() && await isDirUnderGitControl()) {
      const { untracked, unstaged } = await checkGitClean()
      spinner.stop()
      if (untracked.length || unstaged.length) {
        log.info('Found untracked files %o and unstaged files %s', untracked, unstaged)
        const answer = await confirm({ message: 'The current directory contains untracked and/or unstaged files. Proceeding may overwrite existing files. Would you like to continue?', default: false })
        if (!answer) {
          log.info('Exit')
          return
        }
      }
    }
    else if ((await readdir('.')).length > 0) {
      spinner.stop()
      const answer = await confirm({ message: 'The current directory is not (or inside) a Git repository. Continuing may taint existing files. Would you like to proceed?' })
      if (!answer) {
        log.info('Exit')
        return
      }
    }
    spinner.stop()

    const answer = await checkbox({
      message: 'Select part templates',
      choices: ids.map(id => ({
        value: id,
        checked: partIds.includes(id),
      })),
      required: true,
    })

    await applyPartTemplates(answer, options)
  })

program.parseAsync()

#!/usr/bin/env node

import path, { join } from 'node:path'
import process from 'node:process'
import { readdir, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { Option, program } from 'commander'
import { readPackage } from 'read-pkg'
import { enableLogger } from '@gloxy/logger'
import ora from 'ora'
import { checkbox, confirm, select } from '@inquirer/prompts'
import { checkGitClean } from 'check-git-clean'
import { pathExists } from 'fs-extra'
import { configs } from './part-configs/index.js'
import { logger } from './utils/logger.js'
import { isDirUnderGitControl } from './utils/isDirUnderGitControl.js'
import { isGitInstalled } from './utils/isGitInstalled.js'
import { applyPartTemplates } from './applyPartTemplates.js'
import { isDirEmpty } from './utils/isDirEmpty.js'
import { projectTypes } from './project-configs/project-types.js'
import { createProject } from './createProject.js'

const version = (await readPackage({ cwd: join(import.meta.dirname, '..') })).version

program
  .name('tmpl')
  .version(version)

program.command('part')
  .description('Select one or more part templates. Part templates will be applied to the current directory.')
  .option('--install', 'install package dependencies after part templates are applied')
  .option('-v, --verbose', 'display verbose logs')
  .option('--src-dir [String]', 'Source directory URI')
  .showHelpAfterError(true)
  .action(async (options, command) => {
    if (options.verbose) {
      enableLogger('templates:*')
    }
    const log = logger('CLI')
    log.debug('Command: %s, options: %o', command.name(), options)

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

    // Resemble choices
    const choices: { name: string, value: { id: string, srcItemId?: string } }[] = []
    for (const { id, srcItems } of configs.values()) {
      if (srcItems) {
        srcItems.forEach((v) => {
          choices.push({
            name: `${id}:${v.id}`,
            value: {
              id,
              srcItemId: v.id,
            },
          })
        })
      }
      else {
        choices.push({
          name: id,
          value: {
            id,
          },
        })
      }
    }

    const answer = await checkbox({
      message: 'Select part templates',
      choices,
      required: true,
    })

    // Split answer
    const ids: string[] = []
    const srcItemIds: (string | undefined)[] = []
    answer.forEach(({ id, srcItemId }) => {
      ids.push(id)
      srcItemIds.push(srcItemId)
    })

    await applyPartTemplates(ids, srcItemIds, options)
  })

program.command('project')
  .description('Create a project with boilterplates')
  .argument('[path]', 'The path where project files will be created. Relative to `root`.', '.')
  .addOption(new Option('--root [root]', 'The root directory where the project directory will be created.').default(`${homedir()}/Projects`))
  .option('--install', 'Install package dependencies after project files are created')
  .option('-v, --verbose', 'Display verbose logs')
  .option('--src-dir [String]', 'Source directory URI')
  .showHelpAfterError(true)
  .action(async (_path, options, command) => {
    if (options.verbose) {
      enableLogger('templates:*')
    }
    const log = logger('CLI')
    log.debug('Command: %s, path: %o, options: %o', command.name(), _path, options)

    const spinner = ora({
      isSilent: process.env.NODE_ENV === 'test' || options.verbose,
    })

    const { root = `${homedir()}/Projects` } = options

    spinner.start('Checking directory...')
    const dirPath = path.resolve(root, _path)
    if (await pathExists(dirPath)) {
      if ((await stat(dirPath)).isFile()) {
        logger.error('%s is not a directory', dirPath)
        spinner.fail(`${dirPath} is not a directory`)
        return
      }

      if (await isDirEmpty(dirPath)) {
        logger.warn('%s is not empty', dirPath)
        spinner.warn(`${dirPath} is not empty`)
        return
      }
    }

    const choices = projectTypes.map(v => ({
      value: v,
    }))

    const answer = await select({
      message: 'Select project types',
      choices,
      default: 'empty',
    })

    await createProject(dirPath, { type: answer })
  })

program.parseAsync()

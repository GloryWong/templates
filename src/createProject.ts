/* eslint-disable no-console */
import { basename, join } from 'node:path'
import process from 'node:process'
import { EOL } from 'node:os'
import { appendFile } from 'node:fs/promises'
import { ensureDir, pathExists } from 'fs-extra/esm'
import { enableLogger } from '@gloxy/logger'
import chalk from 'chalk'
import ora from 'ora'
import { updatePackage } from 'write-package'
import { projectConfigs } from './project-configs/project-configs.js'
import { applyPartTemplates } from './applyPartTemplates.js'
import { logger } from './utils/logger.js'
import type { ApplyPartTemplateOptions } from './applyPartTemplate.js'

export interface CreateProjectOptions extends Pick<ApplyPartTemplateOptions, 'install' | 'verbose' | 'srcDir'> {
  /**
   * Project type
   * @default empty
   */
  type?: string
}

export async function createProject(projectPath: string, options: CreateProjectOptions = {}) {
  const { type = 'empty', install, verbose, srcDir } = options
  if (type && /\s/.test(type))
    throw new Error(`Invalid project type ${type}. Whitespace is not allowed`)

  const config = projectConfigs.get(type)
  if (!config)
    throw new Error(`Invalid project type ${type}. Respective config does not exist`)

  const log = logger('createProject')
  if (verbose) {
    enableLogger('noodle-one:*')
  }
  const spinner = ora({
    isSilent: process.env.NODE_ENV === 'test' || verbose,
  })
  log.info('Ready to create project: %s', basename(projectPath))

  // create dir if not exists
  if (!(await pathExists(projectPath))) {
    await ensureDir(projectPath)
    process.env.NODE_ENV !== 'test' && console.log(chalk.green('Created project directory %s'), projectPath)
  }

  const { partIds: _partIds } = config
  if (_partIds) {
    const partIds: string[] = []
    const srcItemIds: (string | undefined)[] = []
    _partIds.forEach((v) => {
      if (typeof v === 'string') {
        partIds.push(v)
        srcItemIds.push(undefined)
      }
      else {
        partIds.push(v[0])
        srcItemIds.push(v[1])
      }
    })
    log.info('Ready to apply part template %o in rootDir %s', _partIds, projectPath)
    await applyPartTemplates(partIds, srcItemIds, { install, verbose, srcDir, rootDir: projectPath })
  }

  // Update package json
  const { packageJsonUpdates } = config
  if (packageJsonUpdates) {
    log.info('Updating package.json...')
    spinner.start('Updating package.json...')
    await updatePackage(projectPath, packageJsonUpdates)
    spinner.succeed('Updated package.json')
    log.info('Updated package.json')
  }

  // Update content to .gitignore
  const { gitignoreAppends } = config
  if (gitignoreAppends && gitignoreAppends.length) {
    log.info('Updating .gitignore...')
    spinner.start('Updating .gitignore...')
    const gitignorePath = join(projectPath, '.gitignore')
    const content = gitignoreAppends.join(EOL)
    appendFile(
      gitignorePath,
      `${EOL}${content}${EOL}`,
    )
    spinner.succeed('Updated .gitignore')
    log.info('Updated .gitignore')
  }

  process.env.NODE_ENV !== 'test' && console.log('New project is created at %s%s', projectPath, EOL)
}

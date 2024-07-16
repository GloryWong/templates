#!/usr/bin/env node

import { join } from 'node:path'
import { Argument, program } from 'commander'
import { readPackage } from 'read-pkg'
import { enableLogger } from '@gloxy/logger'
import { ids } from './part-configs/index.js'
import { logger } from './utils/logger.js'
import { applyPartTemplates } from './applyPartTemplates.js'

const version = (await readPackage({ cwd: join(import.meta.dirname, '..') })).version

program
  .name('tmpl')
  .version(version)

program.command('apply')
  .description('Apply one or more part templates. Part templates are applied to current working directory.')
  .addArgument(new Argument('<part-id...>', 'part template id.').choices(ids))
  .option('-f, --force', 'overwrite existing files and try to merge valid JSON files')
  .option('--install', 'install package dependencies after part template is applied')
  .option('-v, --verbose', 'display verbose logs')
  .showHelpAfterError(true)
  .action(async (partIds, options, command) => {
    if (options.verbose) {
      enableLogger('templates:*')
    }
    logger('CLI').debug('Command: %s, arg: %s, options: %o', command.name(), partIds, options)
    await applyPartTemplates(partIds, options)
  })

program.parseAsync()

#!/usr/bin/env node

import { join } from 'node:path'
import { Argument, program } from 'commander'
import { readPackage } from 'read-pkg'
import { ids } from './part-configs/index.js'
import { applyPartTemplate } from './applyPartTemplate.js'
import { logger } from './utils/logger.js'

const version = (await readPackage({ cwd: join(import.meta.dirname, '..') })).version

program
  .name('tmpl')
  .version(version)

program.command('apply')
  .description('Apply a part template. Part templates are applied to current working directory by default.')
  .addArgument(new Argument('<part-id>', 'part template id.').choices(ids))
  .option('-f, --force', 'should overwrite existing files')
  .option('-m, --merge', 'should merge existing files. (JSON only)')
  .option('--install', 'install package dependencies after part template is applied')
  .option('-v, --verbose', 'display verbose logs')
  .showHelpAfterError(true)
  .action((partId, options, command) => {
    logger('CLI').info('Command: %s, arg: %s, options: %o', command.name(), partId, options)
    return applyPartTemplate(partId, options)
  })

program.parseAsync()

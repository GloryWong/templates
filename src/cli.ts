#!/usr/bin/env node

import { Argument, program } from 'commander'
import { readPackage } from 'read-pkg'
import { ids } from './part-configs/index.js'
import { applyPartTemplate } from './applyPartTemplate.js'

const version = (await readPackage()).version

program
  .name('template')
  .version(version)

program.command('apply')
  .description('Apply a part template. Part templates are applied to current working directory by default.')
  .addArgument(new Argument('<id>', 'part template id.').choices(ids))
  .option('-f, --force', 'should overwrite existing files')
  .option('-m, --merge', 'should merge existing files. (JSON only)')
  .action((partId, options, command) => {
    console.log(partId, options, command.name())
    return applyPartTemplate(partId, options)
  })

program.parseAsync()

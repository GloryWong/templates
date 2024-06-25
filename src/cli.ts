#!/usr/bin/env node

import { Argument, program } from 'commander'
import { readPackage } from 'read-pkg'
import { partNames } from './part-configs/index.js'
import { applyPartTemplate } from './applyPartTemplate.js'

const version = (await readPackage()).version

program
  .name('template')
  .version(version)

program.command('apply')
  .description('Apply a part template. Part templates are applied to current working directory by default.')
  .addArgument(new Argument('<part-name>', 'part template name.').choices(partNames))
  .option('-f, --force', 'should overwrite existing files')
  .option('-m, --merge', 'should merge existing files. (JSON only)')
  .action((partName, options, command) => {
    console.log(partName, options, command.name())
    return applyPartTemplate(partName, options)
  })

program.parseAsync()

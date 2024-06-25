#!/usr/bin/env node

import { Argument, program } from 'commander'
import { readPackage } from 'read-pkg'
import { partConfigs } from './part-configs.js'
import { applyPartTemplate } from './applyPartTemplate.js'

const version = (await readPackage()).version

program
  .name('template')
  .version(version)

program.command('apply')
  .description('Apply a part template. Part templates are applied to current working directory by default.')
  .addArgument(new Argument('<part-name>', 'part template name.').choices(Object.keys(partConfigs)))
  .option('-f, --force', 'should overwrite existing files')
  .option('-m, --merge', 'should merge existing files. (JSON only)')
  .action((partName, options, command) => {
    console.log(partName, options, command.name())
    return applyPartTemplate(partName, options)
  })

program.parseAsync()

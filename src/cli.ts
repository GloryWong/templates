#!/usr/bin/env node

import { createRequire } from 'node:module'
import { Argument, program } from 'commander'
import { PARTS_INFO } from './constants.js'
import { applyPartTemplate } from './applyPartTemplate.js'

const version = createRequire(import.meta.url)('../package.json').version

program
  .name('template')
  .version(version)

program.command('apply')
  .description('Apply a part template. Part templates are applied to current working directory by default.')
  .addArgument(new Argument('<part-name>', 'part template name.').choices(Object.keys(PARTS_INFO)))
  .option('-f, --force', 'should overwrite existing files')
  .option('-m, --merge', 'should merge existing files. (JSON only)')
  .action((partName, options, command) => {
    console.log(partName, options, command.name())
    return applyPartTemplate(partName, options)
  })

program.parseAsync()

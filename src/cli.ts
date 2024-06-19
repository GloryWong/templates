#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'
import { exec } from 'node:child_process'
import { argv as _argv, cwd, env, exit } from 'node:process'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

const argv = yargs(hideBin(_argv))
  .scriptName('create-project')
  .usage('Usage: $0 <project-name> [options]')
  .demandCommand(1, 'You must provide a project name')
  .option('g', {
    alias: 'git',
    type: 'boolean',
    default: false,
    describe: 'Initialize a Git repository',
  })
  .help()
  .parseSync()

const projectName: string = argv._[0] as string
const initGit: boolean = argv.g
const projectDir: string = path.join(env.HOME ?? cwd(), 'Projects', projectName)

if (fs.existsSync(projectDir)) {
  console.error(`${projectDir} has already existed`)
  exit(1)
}

// Create project directory
fs.mkdir(projectDir, { recursive: true }, (err) => {
  if (err) {
    console.error(`Failed to create project directory at ${projectDir}`)
    exit(1)
  }
  console.log(`Project directory created at ${projectDir}`)

  if (initGit) {
    // Initialize Git repository
    exec('git init', { cwd: projectDir }, (err, stdout, stderr) => {
      if (err) {
        console.error(`Failed to initialize Git repository in ${projectDir}`)
        console.error(stderr)
        exit(1)
      }
      console.log(stdout)
      console.log(`Project ${projectName} created successfully.`)
    })
  }
  else {
    console.log(`Project ${projectName} created successfully.`)
  }
})

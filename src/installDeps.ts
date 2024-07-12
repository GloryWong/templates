import { exec as _exec } from 'node:child_process'
import { promisify } from 'node:util'
import type { PackageJson } from 'type-fest'
import { logger } from './utils/logger.js'

const exec = promisify(_exec)

type Deps = PackageJson['dependencies']

const log = logger('installDeps')

function createPkgNameVersions(...deps: Deps[]) {
  const depses = Object.assign({}, ...deps)

  return Object.keys(depses).map(name => `${name}@${depses[name]}`)
}

function _updateDeps(nameVersions: string[]) {
  const cmd = `pnpm update ${nameVersions.join(' ')}`
  log.info('Executing command:', cmd)
  return exec(cmd)
}

export async function installDeps(packageJsonUpdates: PackageJson) {
  const { dependencies, devDependencies, peerDependencies, optionalDependencies } = packageJsonUpdates ?? {}

  if (!dependencies && !devDependencies && !peerDependencies && !optionalDependencies) {
    log.info('No dependencies need to be installed')
    return
  }

  try {
    const nameVersions = createPkgNameVersions(dependencies, devDependencies, peerDependencies, optionalDependencies)
    log.info('Installing package dependencies %s...', nameVersions.join(', '))
    await _updateDeps(nameVersions)
    log.info('Installed package dependencies')
  }
  catch (error) {
    log.error('Failed to install dependencies. %o', error)
    log.info('You can manually install them using `pnpm update`')
  }
}

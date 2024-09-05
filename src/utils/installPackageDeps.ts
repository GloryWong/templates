import type { PackageJson } from 'type-fest'
import { logger } from './logger.js'
import { exec } from './exec.js'

type Deps = PackageJson['dependencies']

const log = logger('installDeps')

function createPkgNameVersions(...deps: Deps[]) {
  const depses = Object.assign({}, ...deps)

  return Object.keys(depses).map(name => `${name}@${depses[name]}`)
}

function _updateDeps(nameVersions: string[], cwd?: string) {
  const cmd = `pnpm update ${nameVersions.join(' ')}`
  log.info('Executing command:', cmd)
  return exec(cmd, { cwd })
}

export async function installPackageDeps(deps: Deps[], cwd?: string) {
  try {
    const nameVersions = createPkgNameVersions(...deps)
    log.info('Installing package dependencies %s...', nameVersions.join(', '))
    await _updateDeps(nameVersions, cwd)
    log.info('Installed package dependencies')
  }
  catch (error) {
    log.error('Failed to install dependencies. %o', error)
    log.info('You can manually install them using `pnpm update`')
  }
}

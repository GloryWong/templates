import { exec as _exec } from 'node:child_process'
import { promisify } from 'node:util'
import type { PackageJson } from 'type-fest'
import type { PartConfig } from './part-configs/definePartConfigs.js'
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
  log.debug('Execute command:', cmd)
  return exec(cmd)
}

export async function installDeps(config: PartConfig) {
  const { dependencies, devDependencies, peerDependencies, optionalDependencies } = config.packageJsonUpdates ?? {}

  if (!dependencies && !devDependencies && !peerDependencies && !optionalDependencies) {
    log.debug('No dependencies need to be installed')
    return
  }

  log.debug('Installing package dependencies...')
  try {
    const nameVersions = createPkgNameVersions(dependencies, devDependencies, peerDependencies, optionalDependencies)
    await _updateDeps(nameVersions)
    log.debug('Installed package dependencies')
  }
  catch (error) {
    log.error('Failed to install dependencies. %o', error)
    log.debug('You can manually install them using `pnpm update`')
  }
}

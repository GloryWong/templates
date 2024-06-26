import { exec as _exec } from 'node:child_process'
import { promisify } from 'node:util'
import type { PackageJson } from 'type-fest'
import type { PartConfig } from './part-configs/definePartConfigs.js'

const exec = promisify(_exec)

type Deps = PackageJson['dependencies']

function createPkgNameVersions(...deps: Deps[]) {
  const depses = Object.assign({}, ...deps)

  return Object.keys(depses).map(name => `${name}@${depses[name]}`)
}

function _updateDeps(nameVersions: string[]) {
  const cmd = `pnpm update ${nameVersions.join(' ')}`
  console.log(cmd)
  return exec(cmd)
}

export async function installDeps(config: PartConfig) {
  const { dependencies, devDependencies, peerDependencies, optionalDependencies } = config.packageJsonUpdates ?? {}

  if (!dependencies && !devDependencies && !peerDependencies && !optionalDependencies) {
    console.log('No dependencies need to be installed')
    return
  }

  console.log('Installing package dependencies...')
  try {
    const nameVersions = createPkgNameVersions(dependencies, devDependencies, peerDependencies, optionalDependencies)
    await _updateDeps(nameVersions)
    console.log('Installed package dependencies')
  }
  catch (error) {
    console.error('Failed to install dependencies. %o', error)
    console.log('You can manually install them using `pnpm update`')
  }
}

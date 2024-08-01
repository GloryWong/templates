import { readPackage } from 'read-pkg'
import type { PackageJson } from 'type-fest'
import semver from 'semver'

type Deps = PackageJson['dependencies']

function filterValidDeps(deps: Deps, localPkg: PackageJson, type: 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies') {
  if (!deps)
    return deps

  const localDeps = localPkg[type]

  const result: Record<string, string> = {}

  for (const [name, version] of Object.entries(deps)) {
    if (!version)
      continue

    if (semver.valid(semver.coerce(version)) === null || semver.validRange(version) === null)
      continue

    if (!localDeps?.[name]) {
      result[name] = version
      continue
    }

    if (!semver.subset(localDeps[name], version)) {
      result[name] = version
    }
  }

  return result
}

export async function extractPackageDeps(packageJsonUpdates: PackageJson = {}) {
  let { dependencies, devDependencies, peerDependencies, optionalDependencies } = packageJsonUpdates

  // filter
  const localPkg = await readPackage().catch(() => ({}))
  dependencies = filterValidDeps(dependencies, localPkg, 'dependencies')
  devDependencies = filterValidDeps(devDependencies, localPkg, 'devDependencies')
  peerDependencies = filterValidDeps(peerDependencies, localPkg, 'peerDependencies')
  optionalDependencies = filterValidDeps(optionalDependencies, localPkg, 'optionalDependencies')

  const depsCount = dependencies ? Object.keys(dependencies).length : 0
  const devDepsCount = devDependencies ? Object.keys(devDependencies).length : 0
  const peerDepsCount = peerDependencies ? Object.keys(peerDependencies).length : 0
  const optionalDepsCount = optionalDependencies ? Object.keys(optionalDependencies).length : 0

  return {
    count: depsCount + devDepsCount + peerDepsCount + optionalDepsCount,
    dependencies,
    devDependencies,
    peerDependencies,
    optionalDependencies,
  }
}

import type { PackageJson } from 'type-fest'

export function extractPackageDeps(packageJsonUpdates: PackageJson = {}) {
  const { dependencies, devDependencies, peerDependencies, optionalDependencies } = packageJsonUpdates
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

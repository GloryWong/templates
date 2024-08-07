import { vi } from 'vitest'
import type { PackageJson } from 'type-fest'
import { extractPackageDeps } from '../../src/utils/extractPackageDeps'

const readPackage = vi.hoisted(() => vi.fn().mockResolvedValue({}))
vi.mock('read-pkg', () => ({
  readPackage,
}))

afterAll(() => {
  vi.doUnmock('read-pkg')
})

describe('extractPackageDeps', () => {
  it('should return undefined when a given deps block in packageJsonUpdates does not exist', async () => {
    const localPackageJson: PackageJson = {
      dependencies: {
        foo1: '1',
      },
    }
    const packageJsonUpdates: PackageJson = {}

    const { dependencies } = await extractPackageDeps(packageJsonUpdates, localPackageJson)

    expect(dependencies).toBeUndefined()
  })

  it('should return original deps block when respective local deps block does not exist', async () => {
    const localPackageJson: PackageJson = {}
    const packageJsonUpdates: PackageJson = {
      dependencies: {
        foo1: '^1.1.1',
      },
    }

    const { dependencies } = await extractPackageDeps(packageJsonUpdates, localPackageJson)

    expect(dependencies).toEqual(packageJsonUpdates.dependencies)
  })

  it('should filter out the dep versions which are invalid sematic version', async () => {
    const localPackageJson: PackageJson = {}
    const packageJsonUpdates: PackageJson = {
      dependencies: {
        foo1: '^1.1.1',
        foo2: '2.0',
        foo3: '',
        foo4: 'a.b.c',
      },
    }

    const { dependencies } = await extractPackageDeps(packageJsonUpdates, localPackageJson)

    expect(dependencies).toEqual({ foo1: '^1.1.1', foo2: '2.0' })
  })

  it('should filter out the dep versions which entirely contains respective local dep versions', async () => {
    const localPackageJson: PackageJson = {
      dependencies: {
        foo1: '1.0.0',
        foo2: '1.0.0',
        foo3: '>1.1.1 <2.3.3',
        foo4: '>1.1.1 <2.3.3',
      },
    }
    const packageJsonUpdates: PackageJson = {
      dependencies: {
        foo1: '1.0.0',
        foo2: '>=1.0.0',
        foo3: '>1.0.0 <2.3.4',
        foo4: '>2.0.0',
      },
    }

    const { dependencies } = await extractPackageDeps(packageJsonUpdates, localPackageJson)

    expect(dependencies).toEqual({
      foo4: '>2.0.0',
    })
  })

  it('should return the count of filtered deps of all types', async () => {
    const localPackageJson: PackageJson = {
      dependencies: {
        foo1: '1.0.0',
        foo2: '>1.1.1 <2.3.3',
      },
      devDependencies: {
        foo1: '1.0.0',
        foo2: '>1.1.1 <2.3.3',
      },
      peerDependencies: {
        foo1: '1.0.0',
        foo2: '>1.1.1 <2.3.3',
      },
      optionalDependencies: {
        foo1: '1.0.0',
        foo2: '>1.1.1 <2.3.3',
      },
    }
    const packageJsonUpdates: PackageJson = {
      dependencies: {
        foo1: '1.0.0',
        foo2: '>2.0.0',
      },
      devDependencies: {
        foo1: '1.0.0',
        foo2: '>2.0.0',
      },
      peerDependencies: {
        foo1: '1.0.0',
        foo2: '>2.0.0',
      },
      optionalDependencies: {
        foo1: '1.0.0',
        foo2: '>2.0.0',
      },
    }

    const { count } = await extractPackageDeps(packageJsonUpdates, localPackageJson)

    expect(count).toBe(4)
  })
})

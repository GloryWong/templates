import { vi } from 'vitest'
import type { PartConfigs } from '../src/part-configs'

vi.mock('../src/part-configs.js', (): { partConfigs: PartConfigs } => ({
  partConfigs: {
    partName1: {
      destDir: '.',
    },
    partName2: {
      destDir: './.dir',
    },
    partName3: {
      destDir: '.',
      packageJsonUpdates: {
        name: 'boo',
        dependencies: {
          foo: '^4.3.2',
          foo1: '^5.1.1',
        },
      },
    },
  },
}))

afterAll(() => {
  vi.doUnmock('../src/part-configs.js')
})

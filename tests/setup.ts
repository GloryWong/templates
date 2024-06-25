import { vi } from 'vitest'
import type { PartConfigs } from '../src/part-configs/definePartConfigs'

vi.mock('../src/part-configs/configs.js', (): { configs: PartConfigs } => {
  return ({
    configs: {
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
  })
})

afterAll(() => {
  vi.doUnmock('../src/part-configs/index.js')
})

import { vi } from 'vitest'
import type { PartConfigs } from '../src/part-configs/definePartConfigs'

vi.mock('../src/part-configs/configs.js', (): { configs: PartConfigs } => {
  return ({
    configs: new Map([
      ['partId1', {
        id: 'partId1',
        src: '',
        destDir: '.',
      }],
      [
        'partId2',
        {
          id: 'partId2',
          src: '',
          destDir: '.dir',
        },
      ],
      [
        'partId3',
        {
          id: 'partId3',
          src: '',
          destDir: '.',
          packageJsonUpdates: {
            name: 'boo',
            dependencies: {
              foo: '^4.3.2',
              foo1: '^5.1.1',
            },
          },
        },
      ],
      [
        'partId4',
        {
          id: 'partId4',
          src: '',
          destDir: '.',
          skipTemplate: true,
        },
      ],
    ]),
  })
})

afterAll(() => {
  vi.doUnmock('../src/part-configs/index.js')
})

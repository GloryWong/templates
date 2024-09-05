import { defineProjectConfigs } from './defineProjectConfigs.js'

export const projectConfigs = await defineProjectConfigs([
  {
    id: 'empty',
    description: 'Empty project',
  },
  {
    id: 'node-lib',
    description: 'NodeJS lib',
    partIds: [
      'commitlint',
      'lintstaged',
      'eslint',
      'git',
      ['release', 'release-publish'],
      'typescript',
      'vscode',
      'npm',
      'renovate',
      'readme',
      'test',
      'demo',
    ],
    packageJsonUpdates: {
      main: 'index.js',
      types: 'index.d.ts',
      files: [
        'index.d.ts',
        'index.js',
      ],
      scripts: {
        build: 'tsc',
        prepublishOnly: 'pnpm test && pnpm build',
      },
    },
    gitignoreAppends: [
      'index.d.ts',
      'index.js',
    ],
  },
])

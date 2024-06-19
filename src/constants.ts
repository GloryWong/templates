export const PARTS_INFO = {
  commitlint: {
    dir: '.',
  },
  eslint: {
    dir: '.',
  },
  git: {
    dir: '.',
  },
  github: {
    dir: './.github/workflow',
  },
  typescript: {
    dir: '.',
  },
  vscode: {
    dir: './.vscode',
  },
} as const

export type PartName = keyof typeof PARTS_INFO

import { exec } from './exec.js'

export async function isDirUnderGitControl(cwd?: string) {
  return exec('git rev-parse --is-inside-work-tree', { cwd })
    .then(({ stdout }) => stdout.trim() === 'true')
    .catch(() => false)
}

import { exec } from './exec.js'

export async function isGitInstalled() {
  return exec('git --version')
    .then(() => true)
    .catch(() => false)
}

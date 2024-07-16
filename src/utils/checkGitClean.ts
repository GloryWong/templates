import path from 'node:path'
import process from 'node:process'
import { EOL } from 'node:os'
import { exec } from './exec.js'

export async function checkGitClean(cwd = process.cwd()) {
  try {
    const repoRoot = (await exec('git rev-parse --show-toplevel')).stdout.trim()
    const currentDir = path.relative(repoRoot, cwd)
    const excludeFilePath = path.resolve(import.meta.dirname, 'git-exclude-patterns')

    // Get untracked files
    const untrackedFiles = (await exec(`git ls-files --others --exclude-standard --exclude-from=${excludeFilePath}`)).stdout.trim()

    // Get unstaged files
    const unstagedFiles = (await exec('git diff --name-only')).stdout.trim()

    // Get uncommitted files (staged but not committed)
    const uncommittedFiles = (await exec('git diff --cached --name-only')).stdout.trim()

    // Filter files in the current directory
    const CURRENT_DIR_PATH_PREFIX = `${currentDir ? `${currentDir}/` : ''}`
    const untracked = untrackedFiles.split(EOL).filter(v => !!v)
    const unstaged = unstagedFiles.split(EOL).filter(file => file.startsWith(CURRENT_DIR_PATH_PREFIX)).map(file => file.replace(CURRENT_DIR_PATH_PREFIX, '')).filter(v => !!v)
    const uncommitted = uncommittedFiles.split('\n').filter(file => file.startsWith(CURRENT_DIR_PATH_PREFIX)).map(file => file.replace(CURRENT_DIR_PATH_PREFIX, '')).filter(v => !!v)

    return {
      untracked,
      unstaged,
      uncommitted,
    }
  }
  catch (error) {
    throw new Error(`Failed to check untracked or unstaged in cwd ${cwd}. ${error}`)
  }
}

import type { PathLike } from 'node:fs'
import { readdir } from 'node:fs/promises'

export async function listDirFiles(dirPath: PathLike) {
  return readdir(dirPath, { withFileTypes: true }).then(dirents => dirents.filter(v => v.isFile()).map(v => v.name))
}

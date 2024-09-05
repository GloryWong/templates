import { readdir } from 'node:fs/promises'

export async function isDirEmpty(path: string) {
  return readdir(path).then(v => v.length === 0)
}

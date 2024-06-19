import { remove } from 'fs-extra'
import { getTmpPath } from './getTmpPath.js'

export async function deleteTmp(dirPath: string) {
  const path = await getTmpPath(dirPath)
  return remove(path)
}

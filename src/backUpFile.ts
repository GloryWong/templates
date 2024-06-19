import { basename, extname, join } from 'node:path'
import { copy } from 'fs-extra'
import { getTmpPath } from './getTmpPath.js'

function pad(val: string | number) {
  return String(val).padStart(2, '0')
}

function getDateTime() {
  const date = new Date()
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
}

export async function backUpFile(path: string, destDirPath?: string) {
  const extName = extname(path)
  const rawFileName = basename(path, extName)
  const dest = join(destDirPath ?? await getTmpPath('backups'), `${rawFileName}.backup-${getDateTime()}${extName}`)

  await copy(path, dest)
  return dest
}

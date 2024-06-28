import { basename, extname, join } from 'node:path'
import { copy, ensureDir } from 'fs-extra/esm'
import { getTmpPath } from './getTmpPath.js'
import { logger } from './logger.js'

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
  const backupDir = destDirPath ?? await getTmpPath('backups')
  await ensureDir(backupDir)
  const dest = join(backupDir, `${rawFileName}.backup-${getDateTime()}${extName}`)

  await copy(path, dest)
  logger.warn('Original %s was backed up to %s', basename(path), dest)
  return dest
}

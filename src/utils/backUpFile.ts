import { basename, extname, join } from 'node:path'
import { copy, ensureDir } from 'fs-extra/esm'
import timestamp from 'iso-timestamp'
import { getTmpPath } from './getTmpPath.js'
import { logger } from './logger.js'

export async function backUpFile(path: string, destDirPath?: string) {
  const extName = extname(path)
  const rawFileName = basename(path, extName)
  const backupDir = destDirPath ?? await getTmpPath('backups')
  await ensureDir(backupDir)
  const dest = join(backupDir, `${rawFileName}.backup-${timestamp({ excludeMillisecond: true })}${extName}`)

  await copy(path, dest)
  logger.warn('Original %s was backed up to %s', basename(path), dest)
  return dest
}

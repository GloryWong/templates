import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ensureDir } from 'fs-extra/esm'

const TMP_NAME = 'gloxy-templates'

export async function getTmpPath(dirName: string) {
  const path = join(tmpdir(), TMP_NAME, dirName)
  await ensureDir(path)
  return path
}

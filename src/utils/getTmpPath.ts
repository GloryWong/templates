import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ensureDir } from 'fs-extra/esm'

const TMP_NAME = 'noodle-one'

export async function getTmpPath(dirName: string, dirEnsure = true) {
  const path = join(tmpdir(), TMP_NAME, dirName)
  dirEnsure && await ensureDir(path)
  return path
}

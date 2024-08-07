import readdirp from 'readdirp'

export async function listDirFiles(dirPath: string) {
  const entryInfos = await readdirp.promise(dirPath)
  return entryInfos.map(v => v.path)
}

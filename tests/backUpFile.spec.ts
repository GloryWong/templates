import mockFs from 'mock-fs'
import { readdir } from 'fs-extra'
import { backUpFile } from '../src/backUpFile'
import { getTmpPath } from '../src/getTmpPath'

const cases = [
  ['file1', /^file1\.backup-\d{14}$/],
  ['file2.json', /^file2\.backup-\d{14}\.json$/],
  ['.file3.json', /^\.file3\.backup-\d{14}\.json$/],
  ['.file4', /^\.file4\.backup-\d{14}$/],
] as const

const files = cases.reduce((pre, cur) => {
  pre[cur[0]] = ''
  return pre
}, {})

describe('backUpFile', () => {
  beforeEach(() => {
    mockFs(files)
  })

  afterEach(() => {
    mockFs.restore()
  })

  it.each(cases)('should copy file %s to destination file that matches %s', async (fileName, matchName) => {
    await backUpFile(fileName)
    const fileNames = await readdir(await getTmpPath('backups'))

    expect(fileNames[0]).toMatch(matchName)
  })

  it('should back up to custom destination', async () => {
    await backUpFile(cases[0][0], 'custom-backups')
    const fileNames = await readdir('custom-backups')
    expect(fileNames[0]).toMatch(cases[0][1])
  })
})

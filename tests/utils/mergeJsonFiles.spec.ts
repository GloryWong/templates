import mockFs from 'mock-fs'
import { readJSON, readdir } from 'fs-extra'
import { mergeJsonFiles } from '../../src/utils/mergeJsonFiles'

const file1Json = {
  a: 'a',
  b: 'b',
  c: false,
  e: [1, 2, true, 'a', 'b'],
}

const file2Json = {
  a: 'file2',
  b: true,
  d: 1,
  e: [1, true, 3, 'd', 'b'],
}

describe('mergeJsonFiles', () => {
  beforeEach(() => {
    mockFs({
      src: {
        'file1.json': JSON.stringify(file1Json),
        'invalid.json': 'invalid',
      },
      dest: {
        'file2.json': JSON.stringify(file2Json),
        'invalid.json': 'invalid',
      },
    })
  })

  afterEach(() => {
    mockFs.restore()
  })

  it('should return false when either src or dest file does not exist', async () => {
    expect(await mergeJsonFiles('src/file1.json', 'dest/file3.json')).toBe(false)
    expect(await mergeJsonFiles('src/file3.json', 'dest/file2.json')).toBe(false)
  })

  it('should return false when either src or dest file extensions is not .json', async () => {
    expect(await mergeJsonFiles('src/file1', 'dest/file2.json')).toBe(false)
    expect(await mergeJsonFiles('src/file1.json', 'dest/file2')).toBe(false)
  })

  it('should return false when either src or dest file is an invalid json file', async () => {
    expect(await mergeJsonFiles('src/file1.json', 'dest/invalid.json')).toBe(false)
    expect(await mergeJsonFiles('src/invalid.json', 'dest/file2.json')).toBe(false)
  })

  it('should successfully merge json files without duplicate primitives', async () => {
    const success = await mergeJsonFiles('src/file1.json', 'dest/file2.json')
    expect(success).toBe(true)
    expect(await readJSON('dest/file2.json')).toEqual({
      a: 'a',
      b: 'b',
      c: false,
      d: 1,
      e: [1, true, 3, 'd', 'b', 2, 'a'],
    })
  })

  it('should backup the dest file when backup option is true', async () => {
    await mergeJsonFiles('src/file1.json', 'dest/file2.json', { backUp: true, backupDestDir: 'backups' })

    expect(await readdir('backups')).toEqual([expect.stringMatching(/^file2\.backup-\d+\.json$/)])
  })
})

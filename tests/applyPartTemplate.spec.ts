import { join } from 'node:path'
import { ensureDir, exists, outputFile, readFile, readdir } from 'fs-extra'
import mockFs from 'mock-fs'
import { expect, vi } from 'vitest'
import { applyPartTemplate } from '../src/applyPartTemplate.js'
import { PARTS_INFO } from '../src/constants.js'
import { getTmpPath } from '../src/getTmpPath.js'

const mocks = vi.hoisted(() => ({
  downloadTemplate: vi.fn()
    .mockImplementation(
      async (input: string, { dir }: { dir: string }) => {
        await ensureDir(dir)
        return ({ source: input, dir })
      },
    ),
}))

vi.mock('giget', () => ({
  downloadTemplate: mocks.downloadTemplate,
}))

describe('applyPartTemplate', () => {
  beforeEach(() => {
    mockFs({
      [PARTS_INFO.vscode.dir]: {
        'file1.txt': 'file1',
        'file2.txt': 'file2',
      },
    })
  })

  afterEach(() => {
    mockFs.restore()
  })

  afterAll(() => {
    vi.doUnmock('giget')
  })

  it('should throw error when fail to download', async () => {
    await expect(() => applyPartTemplate('vscode')).rejects.toThrowError(/Failed.*download/)
  })

  it('should copy from tmp to destination directory', async () => {
    mocks.downloadTemplate.mockImplementationOnce(async (input: string, { dir }: { dir: string }) => {
      await outputFile(join(dir, 'file3.txt'), '')
      return ({ source: input, dir })
    })

    await applyPartTemplate('vscode')
    await expect(exists(join(PARTS_INFO.vscode.dir, 'file3.txt'))).resolves.toBeTruthy()
  })

  it('should throw error if file exists in destination', async () => {
    mocks.downloadTemplate.mockImplementationOnce(async (input: string, { dir }: { dir: string }) => {
      await outputFile(join(dir, 'file1.txt'), '123')
      return ({ source: input, dir })
    })

    await expect(() => applyPartTemplate('vscode')).rejects.toThrowError('exists')
  })

  it('should overwrite existing files in destination when use the force option', async () => {
    mocks.downloadTemplate.mockImplementationOnce(async (input: string, { dir }: { dir: string }) => {
      await outputFile(join(dir, 'file1.txt'), '123')
      return ({ source: input, dir })
    })

    await applyPartTemplate('vscode', { force: true })
    const content = (await readFile(join(PARTS_INFO.vscode.dir, 'file1.txt'))).toString()
    expect(content).toEqual('123')
  })

  it('should apply part template', async () => {
    mocks.downloadTemplate.mockImplementationOnce(async (input: string, { dir }: { dir: string }) => {
      await outputFile(join(dir, 'file3.txt'), '')
      await outputFile(join(dir, 'file4.txt'), '')
      return ({ source: input, dir })
    })

    await applyPartTemplate('vscode')
    expect(await readdir(PARTS_INFO.vscode.dir)).toEqual(expect.arrayContaining(['file3.txt', 'file4.txt']))
  })

  it('should clear downloads in tmp, at the end of execution', async () => {
    mocks.downloadTemplate.mockImplementationOnce(async (input: string, { dir }: { dir: string }) => {
      await outputFile(join(dir, 'file3.txt'), '')
      return ({ source: input, dir })
    })

    await applyPartTemplate('vscode')
    expect((await readdir(await getTmpPath('downloads'))).length).toEqual(0)
  })
})

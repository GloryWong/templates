import { join } from 'node:path'
import { ensureDir, exists, outputFile, readdir } from 'fs-extra'
import mockFs from 'mock-fs'
import { expect, vi } from 'vitest'
import { applyPartTemplate } from '../src/applyPartTemplate.js'
import { PART_CONFIGS } from '../src/part-configs.js'
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
      [PART_CONFIGS.vscode.destDir]: {
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
    await expect(exists(join(PART_CONFIGS.vscode.destDir, 'file3.txt'))).resolves.toBeTruthy()
  })

  it('should clear the downloads in tmp, at the end of execution', async () => {
    mocks.downloadTemplate.mockImplementationOnce(async (input: string, { dir }: { dir: string }) => {
      await outputFile(join(dir, 'file3.txt'), '')
      return ({ source: input, dir })
    })

    await applyPartTemplate('vscode')
    expect((await readdir(await getTmpPath('downloads'))).length).toEqual(0)
  })
})

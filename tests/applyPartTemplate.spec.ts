import { join } from 'node:path'
import { ensureDir, exists, outputFile, readdir } from 'fs-extra'
import mockFs from 'mock-fs'
import { expect, vi } from 'vitest'
import { readPackage } from 'read-pkg'
import { applyPartTemplate } from '../src/applyPartTemplate.js'
import { getTmpPath } from '../src/utils/getTmpPath.js'
import { TEMPLATE_DOWNLOAD_DIR } from '../src/constants.js'

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

afterEach(() => {
  mockFs.restore()
})

afterAll(() => {
  vi.doUnmock('giget')
})

describe('applyPartTemplate', () => {
  describe('basic copy template', () => {
    beforeEach(() => {
      mockFs({
        'file1.txt': 'file1',
        'file2.txt': 'file2',
      })
    })

    it('should throw error when passing partId is invalid', async () => {
      await expect(() => applyPartTemplate('test')).rejects.toThrowError(/invalid/i)
    })

    it('should throw error when fail to download', async () => {
      await expect(() => applyPartTemplate('partId1')).rejects.toThrowError(/Failed.*download/)
    })

    it('should copy from tmp to destination directory', async () => {
      mocks.downloadTemplate.mockImplementationOnce(async (input: string, { dir }: { dir: string }) => {
        await outputFile(join(dir, 'file3.txt'), '')
        return ({ source: input, dir })
      })

      await applyPartTemplate('partId2')
      await expect(exists('.dir/file3.txt')).resolves.toBeTruthy()
    })

    it('should skip downloading and coping when skipTemplate config is true', async () => {
      vi.doMock('../src/utils/deleteTmp.js', () => ({
        deleteTmp: vi.fn(),
      }))
      await applyPartTemplate('partId4')
      await expect(async () => readdir(await getTmpPath(TEMPLATE_DOWNLOAD_DIR, false))).rejects.toThrowError(/ENOENT/)
      vi.doUnmock('../src/utils/deleteTmp.js')
    })

    it('should clear the downloads in tmp, at the end of execution', async () => {
      mocks.downloadTemplate.mockImplementationOnce(async (input: string, { dir }: { dir: string }) => {
        await outputFile(join(dir, 'file3.txt'), '')
        return ({ source: input, dir })
      })

      await applyPartTemplate('partId1')
      expect((await readdir(await getTmpPath('downloads'))).length).toEqual(0)
    })
  })

  describe('package json update', () => {
    it('should create package.json when given in partConfigs', async () => {
      mockFs({
        'file1.txt': 'file1',
      })

      mocks.downloadTemplate.mockImplementationOnce(async (input: string, { dir }: { dir: string }) => {
        await outputFile(join(dir, 'file3.txt'), '')
        return ({ source: input, dir })
      })

      await applyPartTemplate('partId3')
      expect((await readPackage()).name).toBe('boo')
    })

    it('should update respective package json props when they are given in partConfigs', async () => {
      mockFs({
        'file1.txt': 'file1',
        'package.json': JSON.stringify({
          name: 'boo1',
          dependencies: {
            foo: '^4.3.1',
            foo2: '^1.0.0',
          },
        }),
      })

      mocks.downloadTemplate.mockImplementationOnce(async (input: string, { dir }: { dir: string }) => {
        await outputFile(join(dir, 'file3.txt'), '')
        return ({ source: input, dir })
      })

      await applyPartTemplate('partId3')
      const pkgJson = await readPackage()
      expect(pkgJson.name).toBe('boo')
      expect(pkgJson.dependencies?.foo).toBe('^4.3.2')
      expect(pkgJson.dependencies?.foo1).toBe('^5.1.1')
      expect(pkgJson.dependencies?.foo2).toBe('^1.0.0')
    })
  })
})

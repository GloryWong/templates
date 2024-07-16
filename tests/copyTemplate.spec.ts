import mockFs from 'mock-fs'
import { readFile, readJSON, readJson } from 'fs-extra'
import merge from 'deepmerge'
import { copyTemplate } from '../src/copyTemplate'

const jsonContent = `{
  "a": "{{var1}}",
  "b": {{var2}},
  "c": "{{var1}}",
  "d": {
    "e": {{var2}}
  },
  "f": {
    "g": {
      "h": {{var3}}
    },
    "k": ["k1", {
      "k2": 1
    }]
  }
}`
const jsonContent1 = `{
  "a": "a1",
  "b": false,
  "c": {
    "cc": 1
  },
  "d": 2,
  "f": {
    "g": {
      "h": "god",
      "i": true
    },
    "k": ["k3", {
      "k4": 2
    }]
  }
}`

describe('copyTemplate', () => {
  describe('dest not exist', () => {
    beforeEach(() => {
      mockFs({
        src: {
          'file1.json': jsonContent,
          'file2.txt': 'file2',
        },
      })
    })

    afterEach(() => {
      mockFs.restore()
    })

    it('should throw error when src does not exist', async () => {
      await expect(() => copyTemplate('src1', 'dest')).rejects.toThrow('not exist')
      await expect(() => copyTemplate('src/file3.json', 'dest')).rejects.toThrow('not exist')
    })

    it('should copy a file when the path is a file', async () => {
      await copyTemplate('src/file1.json', 'dest/file2.json')
      expect((await readFile('dest/file2.json')).toString()).toEqual((await readFile('src/file1.json')).toString())
    })

    it('should copy files with variables assigned', async () => {
      // part of variables
      await copyTemplate('src', 'dest', { variables: {
        var1: 'a',
        var2: true,
      } })

      expect((await readJSON('dest/file1.json'))).toEqual(await readJSON('src/file1.json'))

      // template file with no placeholders should keep untouched
      expect((await readFile('dest/file2.txt')).toString()).toEqual((await readFile('src/file2.txt')).toString())
    })
  })

  describe('dest exists', () => {
    beforeEach(() => {
      mockFs({
        src: {
          'file1.json': jsonContent,
          'file2.txt': 'file2',
          'file3.txt': 'file3',
          'file5.json': jsonContent,
        },
        dest: {
          'file1.json': 'invalid json file',
          'file2.txt': 'file2',
          'file4.txt': 'file4',
          'file5.json': jsonContent1,
        },
      })
    })

    afterEach(() => {
      mockFs.restore()
    })

    it('should merge existing valid json files and overwrite non-json files', async () => {
      const originalDestFile5 = await readJson('dest/file5.json')
      await copyTemplate('src', 'dest', {
        variables: {
          var1: 'a',
          var2: true,
          var3: 123,
        },
      })
      expect(await readJSON('dest/file1.json')).toEqual(await readJson('src/file1.json'))
      expect((await readFile('dest/file2.txt')).toString()).toEqual('file2')
      expect((await readFile('dest/file3.txt')).toString()).toEqual('file3')
      expect((await readFile('dest/file4.txt')).toString()).toEqual('file4')
      expect(await readJSON('dest/file5.json')).toEqual(merge(originalDestFile5, await readJson('src/file5.json')))
    })
  })
})

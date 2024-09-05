import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { assert } from 'vitest'
import * as Sqrl from 'squirrelly'
import { configs } from '../src/part-configs'
import { listDirFiles } from '../src/utils/listDirFiles'

describe('parts-template-check', async () => {
  const dirents = await readdir(join(import.meta.dirname, '../parts'), { withFileTypes: true })

  it('should part template direcotry contain only directory in the first level', () => {
    dirents.forEach((v) => {
      assert.isTrue(v.isDirectory(), `${v.name} should be a directory`)
    })
  })

  it('should part templates be valid syntax', async () => {
    for (const { skipTemplate, id, defaultVariables } of configs.values()) {
      if (!skipTemplate) {
        const dirPath = join(import.meta.dirname, '../parts', id)
        const files = await listDirFiles(dirPath)
        for (const file of files) {
          const template = (await readFile(join(dirPath, file))).toString()
          assert.doesNotThrow(async () => Sqrl.render(template, typeof defaultVariables === 'function' ? await defaultVariables({ rootDir: cwd() }) : (defaultVariables ?? {})), undefined, undefined, `part ${id}'s templates include invalid tags`)
        }
      }
    }
  })

  it('should part configs have respective part template directories found', async () => {
    const dirNames = dirents.map(v => v.name)
    configs.forEach(({ skipTemplate, id }) => {
      if (!skipTemplate)
        assert.isTrue(dirNames.includes(id), `non-skip-template config ${id} should have respective part directory`)
    })
  })
})

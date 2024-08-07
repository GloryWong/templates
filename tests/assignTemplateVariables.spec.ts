import { readFile } from 'node:fs/promises'
import mockFs from 'mock-fs'
import { readJSON } from 'fs-extra'
import { assignTemplateVariables } from '../src/assignTemplateVariables.js'

describe('assignTemplateVariables', () => {
  it('should assign respective variable values', async () => {
    mockFs({
      file: `{
      "a": "{{var1}}",
      "b": ["bb", {{var2}}, 3, "{{ var1}}"],
      "c": "cc",
      "d": {{var3 }}
    }`,
    })

    await assignTemplateVariables('file', {
      var1: 'aa',
      var2: true,
    })

    expect((await readFile('file')).toString('utf-8')).toEqual(`{
      "a": "aa",
      "b": ["bb", true, 3, "aa"],
      "c": "cc",
      "d": {{var3 }}
    }`)

    mockFs.restore()
  })

  it('should assign the given default value if no specifically respective variable', async () => {
    mockFs({
      'file.json': `{
        "a": "aa",
        "b": {{ var1 }},
        "c": {{ var2 }}
      }`,
    })

    await assignTemplateVariables('file.json', {
      var2: true,
    }, null)

    expect(await readJSON('file.json')).toEqual({
      a: 'aa',
      b: null,
      c: true,
    })

    mockFs.restore()
  })
})

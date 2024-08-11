import mockFs from 'mock-fs'
import { readJSON } from 'fs-extra/esm'
import { assignTemplateVariables } from '../src/assignTemplateVariables.js'

describe('assignTemplateVariables', () => {
  it('should assign respective variable values', async () => {
    mockFs({
      file: `{
      "a": "{{it.var1}}",
      "b": ["bb", {{it.var2}}, 3, "{{ it.var1}}"],
      "c": "cc",
      "d": {{it.var3 }}
    }`,
    })

    await assignTemplateVariables('file', {
      var1: 'aa',
      var2: true,
      var3: 1,
    })

    expect(await readJSON('file')).toEqual({
      a: 'aa',
      b: ['bb', true, 3, 'aa'],
      c: 'cc',
      d: 1,
    })

    mockFs.restore()
  })
})

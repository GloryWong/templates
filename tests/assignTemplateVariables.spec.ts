import mockFs from 'mock-fs'
import { readJSON } from 'fs-extra'
import { assignTemplateVariables } from '../src/assignTemplateVariables.js'

describe('assignTemplateVariables', () => {
  beforeEach(() => {
    mockFs({
      'file1.json': `{
        "a": "{{var1}}",
        "b": ["bb", {{var2}}, 3, "{{ var1}}"],
        "c": "cc",
        "d": {{var3 }}
      }`,
    })
  })

  afterEach(() => {
    mockFs.restore()
  })

  it('should assign respective variable values, and default to null if no specifically respective variable', async () => {
    await assignTemplateVariables('file1.json', {
      var1: 'aa',
      var2: true,
    })
    expect(await readJSON('file1.json')).toEqual({
      a: 'aa',
      b: ['bb', true, 3, 'aa'],
      c: 'cc',
      d: null,
    })
  })
})

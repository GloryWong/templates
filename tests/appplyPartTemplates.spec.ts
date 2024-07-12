import { vi } from 'vitest'
import { applyPartTemplates } from '../src/applyPartTemplates'

const mocks = vi.hoisted(() => ({
  applyPartTemplate: vi.fn()
    .mockImplementation((partId: string) => {
      if (!['vscode'].includes(partId))
        throw new Error(`Invalid partId ${partId}`)
    }),
}))

vi.mock('../src/applyPartTemplate.js', () => ({
  applyPartTemplate: mocks.applyPartTemplate,
}))

afterAll(() => {
  vi.doUnmock('../src/applyPartTemplate.js')
})

describe('applyPartTemplates', () => {
  it('should return correct failed parts', async () => {
    const failedParts = await applyPartTemplates(['vscode', 'foo'])
    const failedPart = failedParts[0]
    expect(failedPart.id).toBe('foo')
    expect(failedPart.error).toMatch('Invalid')
  })
})

import { vi } from 'vitest'
import { applyPartTemplates } from '../src/applyPartTemplates'

const mocks = vi.hoisted(() => ({
  applyPartTemplate: vi.fn()
    .mockImplementation((partId: string) => {
      if (!['vscode', 'github'].includes(partId))
        throw new Error(`Invalid partId ${partId}`)
    }),
}))

vi.mock('../src/applyPartTemplate.js', () => ({
  applyPartTemplate: mocks.applyPartTemplate,
}))

afterEach(() => {
  vi.restoreAllMocks()
})

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

  it('should read srcItems in correct order', async () => {
    await applyPartTemplates(['vscode', 'github'], [undefined, 'release-publish'])
    expect(mocks.applyPartTemplate).toHaveBeenNthCalledWith(1, 'vscode', undefined, { skipInstall: true })
    expect(mocks.applyPartTemplate).toHaveBeenNthCalledWith(2, 'github', 'release-publish', { skipInstall: true })
  })
})

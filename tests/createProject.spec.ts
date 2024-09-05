import { readdir, stat } from 'node:fs/promises'
import { vi } from 'vitest'
import mockFs from 'mock-fs'
import { createProject } from '../src/createProject'

const mocks = vi.hoisted(() => ({
  applyPartTemplates: vi.fn(),
}))

vi.mock('../src/applyPartTemplates.js', () => ({
  applyPartTemplates: mocks.applyPartTemplates,
}))

beforeEach(() => {
  mockFs({})
})

afterEach(() => {
  mockFs.restore()
  vi.restoreAllMocks()
})

afterAll(() => {
  vi.doUnmock('../src/applyPartTemplate.js')
})

describe('createProject', () => {
  it('should throw error when passing project type is invalid', async () => {
    await expect(() => createProject('test-project', {
      type: 'invalid type',
    })).rejects.toThrow(/not allowed/i)
  })

  it('should throw error when passing project type does not exist', async () => {
    await expect(() => createProject('test-project', {
      type: 'invalid-type',
    })).rejects.toThrow(/not exist/i)
  })

  it('should create a directory for the project path when it does not exist', async () => {
    await createProject('test-project')
    expect(await readdir('.')).toEqual(['test-project'])
    expect((await stat('test-project')).isDirectory()).toBeTruthy()
  })
})

import { vi } from 'vitest'

vi.mock('@inquirer/prompts', () => ({
  confirm: vi.fn(() => Promise.resolve(true)),
}))

vi.mock('../src/utils/installPackageDeps.js', () => ({
  installPackageDeps: vi.fn(() => Promise.resolve()),
}))

afterAll(() => {
  vi.doUnmock('@inquirer/prompts')
  vi.doUnmock('../src/utils/installPackageDeps.js')
})

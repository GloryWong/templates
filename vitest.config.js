import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'istanbul',
      include: ['./src/**/*'],
      reporter: ['text', 'json', 'html'],
    },
  },
})

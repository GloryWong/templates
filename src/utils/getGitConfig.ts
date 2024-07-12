import type { Simplify } from 'type-fest'
import { exec } from './exec.js'

/**
 * @param nameKeys name-keys. E.g. { userName: 'user.name' }
 * @returns A record of the configuration values. (only successful result)
 */
export async function getGitConfigs<T extends Record<string, string>>(nameKeys: T) {
  const resultP = await Promise.allSettled(Object.entries(nameKeys).map(async ([name, key]) => {
    const { stdout } = await exec(`git config --get ${key}`)
    return { name, value: stdout.trim() }
  }))

  const results = resultP.reduce((acc, result) => {
    if (result.status === 'fulfilled') {
      acc[result.value.name] = result.value.value
    }
    return acc
  }, {} as Record<string, string>)

  return results as Simplify<Partial<T>>
}

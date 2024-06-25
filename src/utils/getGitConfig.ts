import { exec as _exec } from 'node:child_process'
import { promisify } from 'node:util'

/**
 * @param nameKeys name-keys. E.g. { userName: 'user.name' }
 * @returns A record of the configuration values. (only successful result)
 */
export async function getGitConfigs(nameKeys: Record<string, string>) {
  const exec = promisify(_exec)
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

  return results
}

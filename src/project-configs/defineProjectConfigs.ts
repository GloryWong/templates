import type { PackageJson } from 'type-fest'

interface DefineConfigsItem {
  id: string
  description?: string
  /**
   * The parts needed to be used
   *
   * partId or [partId, srcItemId]
   */
  partIds?: (string | [id: string, srcItemId: string])[]
  /**
   * Update properties of package.json file. Create a package.json file if necessary.
   * Override same properties defined in part configs.
   */
  packageJsonUpdates?: PackageJson
  /**
   * Append content to the file `.gitignore` line by line. Create `.gitignore` if necessary.
   */
  gitignoreAppends?: string[]
}

type DefineConfigs = DefineConfigsItem[]

export interface ProjectConfig extends DefineConfigsItem {
  //
}

export type ProjectConfigs = Map<string, ProjectConfig>

export async function defineProjectConfigs(configs: DefineConfigs) {
  const result: ProjectConfigs = new Map()
  for (let index = 0; index < configs.length; index++) {
    const config = configs[index]
    const item: Record<string, any> = { id: '' }
    const keys = Object.keys(config) as (keyof DefineConfigsItem)[]
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index]
      const value = config[key]
      item[key] = value
    }
    result.set(item.id, item as ProjectConfig)
  }

  return result
}

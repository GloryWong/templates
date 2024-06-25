import type { PackageJson, SetRequired } from 'type-fest'
import type { TemplateVariables } from '../types.js'
import { PART_TEMPLATE_LOCATION } from '../constants.js'

interface DefineConfigsItem {
  /**
   * Part template id, which must be an existing folder name in the template repo's **parts**
   */
  id: string
  description?: string
  /**
   * The destination directory to which the part template will be copied.
   * Relative to process.cwd()
   * @default process.cwd()
   */
  destDir?: string
  /**
   * Update properties of package.json file. Create a package.json file if not exists.
   */
  packageJsonUpdates?: PackageJson
  /**
   * The default variable values of templates
   */
  defaultVariables?: TemplateVariables | (() => TemplateVariables | Promise<TemplateVariables>)
}

type DefineConfigs = DefineConfigsItem[]

export interface PartConfig extends SetRequired<DefineConfigsItem, 'destDir'> {
  src: string
  defaultVariables?: TemplateVariables
}
export type PartConfigs = Map<string, PartConfig>

export async function definePartConfigs(configs: DefineConfigs) {
  const result: PartConfigs = new Map()
  for (let index = 0; index < configs.length; index++) {
    const config = configs[index]
    const item: PartConfig = { id: '', src: '', destDir: '.' }
    for (const [key, value] of Object.entries(config) as [keyof DefineConfigsItem, any][]) {
      item[key] = typeof value === 'function' ? await value() : value
    }
    item.src = `${PART_TEMPLATE_LOCATION}/${item.id}#master`
    result.set(item.id, item)
  }

  return result
}

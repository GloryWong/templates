import type { PackageJson } from 'type-fest'
import type { TemplateVariables } from '../types.js'

export interface PartConfig {
  /**
   * The destination directory.
   * Relative to process.cwd()
   */
  destDir: string
  packageJsonUpdates?: PackageJson
  defaultTemplateVariables?: TemplateVariables | (() => TemplateVariables | Promise<TemplateVariables>)
}
export type PartConfigs = Readonly<Record<string, PartConfig>>

export function definePartConfigs(partConfigs: PartConfigs): PartConfigs {
  return partConfigs
}

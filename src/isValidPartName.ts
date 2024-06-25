import { partConfigs } from './part-configs.js'

export function isValidPartName(name: string) {
  return name in partConfigs
}

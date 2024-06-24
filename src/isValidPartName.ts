import { PART_CONFIGS } from './part-configs.js'

export function isValidPartName(name: string) {
  return name in PART_CONFIGS
}

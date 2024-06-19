import type { PartName } from './constants.js'
import { PARTS_INFO } from './constants.js'

export function isValidPartName(name: PartName) {
  return name in PARTS_INFO
}

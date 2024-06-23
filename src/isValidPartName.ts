import { PARTS_INFO } from './constants.js'

export function isValidPartName(name: string) {
  return name in PARTS_INFO
}

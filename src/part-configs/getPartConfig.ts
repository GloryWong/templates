import { configs } from './configs.js'

export function getPartConfig(partName: string) {
  if (!(partName in configs))
    return undefined
  return configs[partName]
}

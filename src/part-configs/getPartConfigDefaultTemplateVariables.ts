import { configs } from './configs.js'

export function getPartConfigDefaultTemplateVariables(partName: string) {
  const { defaultTemplateVariables } = configs[partName]
  if (!defaultTemplateVariables)
    return {}
  if (typeof defaultTemplateVariables === 'function') {
    return defaultTemplateVariables()
  }

  return defaultTemplateVariables
}

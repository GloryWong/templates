import { readFile } from 'node:fs/promises'
import { outputFile } from 'fs-extra/esm'
import type { TemplateVariables } from './types.js'

export async function assignTemplateVariables(filePath: string, variables: TemplateVariables) {
  const content = (await readFile(filePath)).toString()
  const newContent = content.replace(/\{\{(.+?)\}\}/g, (_, key: string) => {
    return variables[key.trim()] === undefined ? 'null' : String(variables[key.trim()]).trim()
  })

  return outputFile(filePath, newContent)
}

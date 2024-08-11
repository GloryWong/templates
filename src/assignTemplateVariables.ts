import { readFile } from 'node:fs/promises'
import { outputFile } from 'fs-extra/esm'
import * as Sqrl from 'squirrelly'
import type { TemplateVariables } from './types.js'

export async function assignTemplateVariables(filePath: string, variables: TemplateVariables) {
  const content = (await readFile(filePath)).toString()
  const newContent = Sqrl.render(content, variables, { autoTrim: false })

  return outputFile(filePath, newContent)
}

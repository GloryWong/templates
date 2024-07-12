/* eslint-disable no-console */
import { EOL } from 'node:os'
import process from 'node:process'
import chalk from 'chalk'
import { type ApplyPartTemplateOptions, applyPartTemplate } from './applyPartTemplate.js'

export async function applyPartTemplates(partIds: string[], options: ApplyPartTemplateOptions = {}) {
  const successfulPartIds: string[] = []
  const failedParts: {
    id: string
    error: string
  }[] = []

  for (let index = 0; index < partIds.length; index++) {
    const partId = partIds[index]
    process.env.NODE_ENV !== 'test' && console.log(chalk.blue('[%s]'), partId)
    try {
      await applyPartTemplate(partId, options)
      successfulPartIds.push(partId)
      process.env.NODE_ENV !== 'test' && console.log(chalk.green('Apply %s successfully%s'), partId, EOL)
    }
    catch (error) {
      process.env.NODE_ENV !== 'test' && console.error(chalk.red('Failed to apply %s%s'), String(error), EOL)
      failedParts.push({ id: partId, error: String(error) })
    }
  }

  process.env.NODE_ENV !== 'test' && console.log('Success(%d), Failed(%d)', successfulPartIds.length, failedParts.length)

  return failedParts
}

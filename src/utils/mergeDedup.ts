import merge from 'deepmerge'

/**
 * Merge with primitives in arrays deduplicated
 */
export function mergeDedup<T>(x: Partial<T>, y: Partial<T>) {
  return merge(x, y, {
    arrayMerge(target, source) { // For primitives, deduplicate
      return [...new Set([...target, ...source])]
    },
  })
}

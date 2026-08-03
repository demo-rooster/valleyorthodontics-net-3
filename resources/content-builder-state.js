const serialize = value => JSON.stringify(value || null)

export const getDraftStatus = (page, baseline, savedPage) => {
  if (!page) {
    return 'unavailable'
  }

  const reference = savedPage || baseline

  return serialize(page) === serialize(reference) ? 'saved' : 'unsaved'
}

export const confirmDiscardChanges = (hasUnsavedChanges, confirm) => {
  return !hasUnsavedChanges || confirm('Discard unsaved page changes?')
}

export const setSEOValue = (seo, path, value) => {
  const result = JSON.parse(JSON.stringify(seo || {}))
  let target = result

  path.slice(0, -1).forEach((key) => {
    target[key] = target[key] && typeof target[key] === 'object' ? target[key] : {}
    target = target[key]
  })
  target[path[path.length - 1]] = value

  return result
}

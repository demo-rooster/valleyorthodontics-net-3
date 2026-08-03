export const filterMediaAssets = (assets, type, query = '') => {
  const normalizedQuery = query.trim().toLowerCase()

  return assets.filter((asset) => {
    if (asset.type !== type) {
      return false
    }

    return !normalizedQuery || `${asset.label} ${asset.src}`.toLowerCase().includes(normalizedQuery)
  })
}

export const mediaPreviewSource = (asset, cdn = '') => {
  const source = asset.poster || asset.image?.src || asset.src

  return String(source || '').replace(/\{\{cdn\}\}/g, cdn)
}

export const mergeMediaAsset = (value, selectedAsset) => {
  const asset = { ...selectedAsset }
  delete asset.label
  delete asset.type

  return { ...value, ...asset }
}

export const filterIconNames = (icons, query = '') => {
  const normalizedQuery = query.trim().toLowerCase()

  return icons.filter(icon => !normalizedQuery || icon.toLowerCase().includes(normalizedQuery))
}

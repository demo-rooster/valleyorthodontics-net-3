import globalData from '~/data/globalData.json'
import pagesData from '~/data/pages.json'
import postsData from '~/data/posts.json'
import themeData from '~/data/theme.json'

const imageExtensions = /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i
const videoExtensions = /\.(m4v|mov|mp4|webm)(\?.*)?$/i
const imageKeys = new Set(['image', 'images', 'poster', 'thumbnail', 'featured_image', 'logo_config'])
const videoKeys = new Set(['video', 'videos'])
const iconContexts = process.env.NODE_ENV === 'test'
  ? []
  : [
    require.context('../assets/icons', false, /\.svg$/),
    require.context('../assets/dental-icons', false, /\.svg$/)
  ]

const labelFromUrl = (value) => {
  const clean = String(value || '').split('?')[0]
  const name = clean.split('/').pop() || clean

  return decodeURIComponent(name).replace(/[-_]+/g, ' ')
}

const mediaUrl = value => typeof value === 'string' && (/^https?:\/\//.test(value) || /^\{\{cdn\}\}/.test(value))

const canonicalUrl = value => String(value || '')
  .replace(/tr:[^/]+\//, '')
  .replace(/\.(webp|jpe?g|png)(\?.*)?$/i, '')

const addAsset = (catalog, type, record) => {
  const src = record.src || record.url || record.poster || record.image

  if (!mediaUrl(src)) {
    return
  }

  const key = `${type}:${canonicalUrl(src)}`
  const current = catalog.get(key) || {}

  catalog.set(key, {
    ...current,
    ...record,
    type,
    src,
    label: record.alt || record.title || current.label || labelFromUrl(src)
  })
}

const visit = (value, key, catalog) => {
  if (Array.isArray(value)) {
    value.forEach(item => visit(item, key, catalog))
    return
  }

  if (!value || typeof value !== 'object') {
    if (key === 'poster' && mediaUrl(value)) {
      addAsset(catalog, 'image', { src: value, poster: true })
    }
    return
  }

  const src = value.src || value.url || value.image

  if (imageKeys.has(key) && mediaUrl(src) && imageExtensions.test(src)) {
    addAsset(catalog, 'image', value)
  }

  if (videoKeys.has(key) && mediaUrl(src) && (videoExtensions.test(src) || value.type === 'embedded')) {
    addAsset(catalog, 'video', value)
  }

  if (mediaUrl(value.poster)) {
    addAsset(catalog, 'image', { src: value.poster, title: value.title, poster: true })
  }

  Object.keys(value).forEach(childKey => visit(value[childKey], childKey, catalog))
}

export const getMediaCatalog = () => {
  const catalog = new Map()

  ;[pagesData, postsData, globalData, themeData].forEach(data => visit(data, '', catalog))

  return [...catalog.values()].sort((a, b) => a.label.localeCompare(b.label))
}

const contextIconNames = () => {
  return iconContexts.reduce((names, context) => [
    ...names,
    ...context.keys().map(key => key.replace(/^\.\//, '').replace(/\.svg$/, ''))
  ], [])
}

export const getIconCatalog = () => [...new Set(contextIconNames())].sort()

const clone = value => JSON.parse(JSON.stringify(value))

const hiddenKeys = new Set([
  '__builder_id',
  'acf_fc_layout',
  'image_selection_hints',
  'loading_mask',
  'bgColor',
  'addLoader',
  'forceAlt'
])

const multilineKeys = new Set([
  'text',
  'description',
  'content',
  'caption',
  'quote',
  'answer'
])

const richTextKeys = new Set(['text', 'content', 'description', 'answer'])

const enumOptions = {
  background: ['', 'bg1', 'bg2'],
  background_type: ['', 'has_background', 'has_image'],
  component_padding: ['none', 'quarter', 'half', 'full'],
  component_margins: ['none', 'quarter', 'half', 'full'],
  content_alignment: ['left', 'center', 'right'],
  media_type: ['image', 'video', 'icon'],
  objectPosition: ['center', 'center top', 'center bottom', 'left', 'right'],
  style: ['primary', 'secondary', 'simple'],
  title_color: ['text', 'primary', 'secondary', 'white'],
  title_underline_color: ['none', 'primary', 'secondary'],
  type: ['nuxt', 'external', 'embedded', 'video']
}

const emptyImage = {
  src: '',
  webp: '',
  alt: '',
  aria_hidden: false,
  bgColor: '',
  imageBackground: false,
  addLoader: false,
  objectPosition: '',
  forceAlt: '',
  loading_mask: '',
  image_selection_hints: null
}

const arrayItemDefaults = {
  accordion: {
    header: '',
    paragraphs: [{ text: '' }],
    has_media: false,
    media_type: 'image',
    image: emptyImage,
    video: { type: 'embedded', src: '' }
  },
  buttons: {
    button: {
      type: 'nuxt',
      style: 'secondary',
      label: '',
      aria_label: '',
      href: '',
      path: '',
      hash: '',
      external: false,
      include_icon: false,
      icon: '',
      color: 'black'
    }
  },
  paragraphs: { text: '' },
  social_links: { href: '', icon: '' }
}

const humanize = value => String(value || '')
  .replace(/_/g, ' ')
  .replace(/\b\w/g, letter => letter.toUpperCase())

export const getPathValue = (source, path = []) => path.reduce((value, key) => {
  if (value === undefined || value === null) {
    return undefined
  }

  return value[key]
}, source)

export const setPathValue = (source, path, value) => {
  if (!path.length) {
    return clone(value)
  }

  const result = clone(source)
  let target = result

  path.slice(0, -1).forEach((key) => {
    target = target[key]
  })
  target[path[path.length - 1]] = clone(value)

  return result
}

export const addPathItem = (source, path, value) => {
  const items = getPathValue(source, path)

  return setPathValue(source, path, [...items, clone(value)])
}

export const removePathItem = (source, path, index) => {
  const items = [...getPathValue(source, path)]
  items.splice(index, 1)

  return setPathValue(source, path, items)
}

export const movePathItem = (source, path, index, direction) => {
  const items = [...getPathValue(source, path)]
  const nextIndex = index + direction

  if (nextIndex < 0 || nextIndex >= items.length) {
    return clone(source)
  }

  const item = items.splice(index, 1)[0]
  items.splice(nextIndex, 0, item)

  return setPathValue(source, path, items)
}

export const duplicatePathItem = (source, path, index) => {
  const items = [...getPathValue(source, path)]
  items.splice(index + 1, 0, clone(items[index]))

  return setPathValue(source, path, items)
}

export const fieldDescriptor = (key, value, path = []) => {
  if (hiddenKeys.has(key)) {
    return null
  }

  const descriptor = {
    key,
    label: humanize(key),
    path: [...path, key],
    value
  }

  if (Array.isArray(value)) {
    return { ...descriptor, type: 'array' }
  }

  if (value && typeof value === 'object') {
    if (key === 'image') {
      return { ...descriptor, type: 'image' }
    }
    if (key === 'video') {
      return { ...descriptor, type: 'video' }
    }
    return { ...descriptor, type: 'object' }
  }

  if (typeof value === 'boolean') {
    return { ...descriptor, type: 'boolean' }
  }

  if (typeof value === 'number') {
    return { ...descriptor, type: 'number' }
  }

  if (key === 'icon') {
    return { ...descriptor, type: 'icon' }
  }

  if (enumOptions[key]) {
    return { ...descriptor, type: 'select', options: enumOptions[key] }
  }

  if (multilineKeys.has(key) || String(value || '').length > 100) {
    return { ...descriptor, type: richTextKeys.has(key) ? 'richtext' : 'textarea' }
  }

  return { ...descriptor, type: 'text' }
}

export const describeObject = (value, path = []) => Object.keys(value || {})
  .map(key => fieldDescriptor(key, value[key], path))
  .filter(Boolean)

export const defaultArrayItem = (items, key = 'item') => {
  if (arrayItemDefaults[key]) {
    return clone(arrayItemDefaults[key])
  }

  if (items.length) {
    return clone(items[items.length - 1])
  }

  return { title: '', text: '' }
}

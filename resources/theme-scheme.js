import { buildGradientCss, normalizeGradient } from './gradients'

export const schemeVariants = ['light', 'dark']
export const transparentSlotRef = 'transparent'
export const darkLuminanceThreshold = 0.5

const familyNames = ['Primary', 'Secondary', 'Tertiary', 'Quaternary', 'Quinary', 'Senary', 'Septenary']
const backgroundGradientLabels = ['bg-1', 'bg-2']
const huePairingWindow = 30
const minPairingChroma = 0.15
const autoCounterpartMix = 0.8
const semanticRoleSeeds = [
  { label: 'headers', source: 'primary', name: 'Titles', description: 'Headings and titles site-wide' },
  { label: 'btn-background', source: 'accent', name: 'Button background', description: 'CTA, form and block buttons' },
  { label: 'btn-hover-text', source: 'text', name: 'Hover text', description: 'Button text and border on hover' },
  { label: 'header-footer', source: 'secondary', name: 'Header & footer', description: 'Navigation bar and footer background' }
]

export const titleVariantRoles = [
  { key: 'titles-light', name: 'Titles (Light)', description: 'Title color on light section backgrounds', category: 'text' },
  { key: 'titles-dark', name: 'Titles (Dark)', description: 'Title color on dark section backgrounds', category: 'text' }
]

export const elementRoleCategories = [
  { key: 'text', label: 'Text' },
  { key: 'buttons', label: 'Buttons' },
  { key: 'backgrounds', label: 'Backgrounds' },
  { key: 'accents', label: 'Accents' }
]

export const elementRoles = [
  ...titleVariantRoles,
  { key: 'text', name: 'Body', description: 'Body copy, paragraphs, links', category: 'text' },
  { key: 'btn-background', name: 'Button background', description: 'CTA, form and block buttons', category: 'buttons' },
  { key: 'btn-text', name: 'Button text', description: 'Text on buttons', category: 'buttons' },
  { key: 'btn-hover-background', name: 'Hover background', description: 'Button background on hover', allowsTransparent: true, category: 'buttons' },
  { key: 'btn-hover-text', name: 'Hover text', description: 'Button text and border on hover', category: 'buttons' },
  { key: 'header-footer', name: 'Header & footer', description: 'Navigation bar and footer background', category: 'backgrounds' },
  { key: 'bg-1', name: 'Background 1', description: 'Main page background', allowsGradient: true, category: 'backgrounds' },
  { key: 'bg-2', name: 'Background 2', description: 'Alternate section background', allowsGradient: true, category: 'backgrounds' },
  { key: 'primary', name: 'Brand accent', description: 'Links, icons, borders, hero overlay', category: 'accents' },
  { key: 'secondary', name: 'Highlight', description: 'Banner tints, hovers, gallery highlights', category: 'accents' },
  { key: 'accent', name: 'Soft accent', description: 'Light fills: cards, tags, nav hovers', category: 'accents' }
]

export const topbarRoles = [
  { key: 'topbar-light', name: 'Top bar (light)', description: 'Background when style is light' },
  { key: 'topbar-dark', name: 'Top bar (dark)', description: 'Background when style is dark' }
]

export const popupRoles = [
  { key: 'popup-background', name: 'Background', description: 'Pop-up window background' },
  { key: 'popup-titles', name: 'Title', description: 'Pop-up title text' },
  { key: 'popup-text', name: 'Body', description: 'Pop-up body copy' }
]

export const sectionOverrideRoles = [
  { key: 'titles', name: 'Titles' },
  { key: 'text', name: 'Body text' },
  { key: 'btn-background', name: 'Buttons' },
  { key: 'background', name: 'Section background' }
]

const derivedColorRoles = [...titleVariantRoles, ...popupRoles]
const derivedRoleLabels = derivedColorRoles.map(role => role.key)

const clampChannel = (value = 0) => Math.max(0, Math.min(255, Math.round(value)))

const toHexChannel = value => clampChannel(value).toString(16).padStart(2, '0')

export const rgbToHex = (color = {}) => `#${toHexChannel(color.red)}${toHexChannel(color.green)}${toHexChannel(color.blue)}`.toUpperCase()

export const normalizeHex = (hex = '') => (hex.charAt(0) === '#' ? hex : `#${hex}`).toUpperCase()

export const hexToRgb = (hex) => {
  const value = normalizeHex(hex).replace('#', '')

  if (!/^[0-9A-F]{6}$/i.test(value)) {
    return null
  }

  const colorValue = parseInt(value, 16)

  return {
    red: (colorValue >> 16) & 255,
    green: (colorValue >> 8) & 255,
    blue: colorValue & 255
  }
}

const linearizeChannel = (value = 0) => {
  const channel = clampChannel(value) / 255

  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
}

export const relativeLuminance = (color = {}) =>
  (0.2126 * linearizeChannel(color.red)) + (0.7152 * linearizeChannel(color.green)) + (0.0722 * linearizeChannel(color.blue))

export const isDarkColor = (value) => {
  if (!value) {
    return false
  }

  const gradient = value.gradient ? normalizeGradient(value.gradient, value.color) : null

  if (gradient && gradient.enabled) {
    const stops = gradient.colors.map(hexToRgb).filter(Boolean)

    if (stops.length) {
      const average = stops.reduce((sum, stop) => sum + relativeLuminance(stop), 0) / stops.length

      return average < darkLuminanceThreshold
    }
  }

  const color = value.color || value

  if (color.alpha === 0) {
    return false
  }

  return relativeLuminance(color) < darkLuminanceThreshold
}

export const formatSlotRef = (familyKey, variant) => `${familyKey}.${variant}`

export const parseSlotRef = (ref) => {
  if (typeof ref !== 'string' || ref === transparentSlotRef) {
    return null
  }

  const separatorIndex = ref.lastIndexOf('.')

  if (separatorIndex < 1) {
    return null
  }

  const variant = ref.slice(separatorIndex + 1)

  if (!schemeVariants.includes(variant)) {
    return null
  }

  return { familyKey: ref.slice(0, separatorIndex), variant }
}

const transparentValue = () => ({
  hex: '#ffffff',
  color: { red: 255, green: 255, blue: 255, alpha: 0 }
})

export const getSlotValue = (scheme = [], ref) => {
  if (ref === transparentSlotRef) {
    return transparentValue()
  }

  const parsed = parseSlotRef(ref)

  if (!parsed) {
    return null
  }

  const family = scheme.find(item => item.key === parsed.familyKey)
  const slot = family && family[parsed.variant]

  if (!slot || !slot.color) {
    return null
  }

  const value = {
    hex: slot.hex || rgbToHex(slot.color),
    color: { alpha: 1, ...slot.color }
  }

  if (slot.gradient) {
    value.gradient = slot.gradient
  }

  return value
}

export const slotCssValue = (value) => {
  if (!value) {
    return ''
  }

  const gradient = value.gradient ? normalizeGradient(value.gradient, value.color) : null

  if (gradient && gradient.enabled) {
    return buildGradientCss(gradient)
  }

  const color = { alpha: 1, ...value.color }

  return `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha})`
}

const rgbChannels = (color = {}) => [color.red, color.green, color.blue].map(value => clampChannel(value) / 255)

const chromaOf = (color) => {
  const channels = rgbChannels(color)

  return Math.max(...channels) - Math.min(...channels)
}

const hueOf = (color) => {
  const [red, green, blue] = rgbChannels(color)
  const max = Math.max(red, green, blue)
  const delta = max - Math.min(red, green, blue)

  if (!delta) {
    return null
  }

  let hue

  if (max === red) {
    hue = ((green - blue) / delta) % 6
  } else if (max === green) {
    hue = ((blue - red) / delta) + 2
  } else {
    hue = ((red - green) / delta) + 4
  }

  return (((hue * 60) % 360) + 360) % 360
}

const hueDistance = (a, b) => {
  const diff = Math.abs(a - b) % 360

  return diff > 180 ? 360 - diff : diff
}

const mixChannel = (value, target) => Math.round(value + ((target - value) * autoCounterpartMix))

const autoCounterpartSlot = (color, variant) => {
  const target = variant === 'light' ? 255 : 0
  const mixed = {
    red: mixChannel(color.red, target),
    green: mixChannel(color.green, target),
    blue: mixChannel(color.blue, target),
    alpha: 1
  }

  return { hex: rgbToHex(mixed), color: mixed }
}

const cloneValue = value => JSON.parse(JSON.stringify(value))

const fixedColorEntry = (label, name, description, hex, red, green, blue, alpha) => ({
  label,
  name,
  description,
  color: { red, green, blue, alpha },
  hex
})

const ensureSemanticColors = (theme) => {
  const colors = cloneValue(theme.colors)

  semanticRoleSeeds.forEach((seed) => {
    if (colors.some(color => color.label === seed.label)) {
      return
    }

    const source = colors.find(color => color.label === seed.source)

    if (source) {
      colors.push({ ...cloneValue(source), label: seed.label, name: seed.name, description: seed.description })
    }
  })

  if (!colors.some(color => color.label === 'btn-text')) {
    colors.push(fixedColorEntry('btn-text', 'Button text', 'Text on buttons', '#FFFFFF', 255, 255, 255, 1))
  }

  if (!colors.some(color => color.label === 'btn-hover-background')) {
    colors.push(fixedColorEntry('btn-hover-background', 'Hover background', 'Button background on hover', '#FFFFFF', 255, 255, 255, 0))
  }

  return { ...theme, colors }
}

const swatchSlot = (swatch) => {
  const slot = {
    hex: swatch.hex,
    color: { ...swatch.color, alpha: 1 }
  }

  if (swatch.gradient) {
    slot.gradient = cloneValue(swatch.gradient)
  }

  return slot
}

const familyNameAt = index => familyNames[index] || `Family ${index + 1}`

const familyKeyAt = index => (familyNames[index] || `family-${index + 1}`).toLowerCase()

const collectSwatches = (colors) => {
  const swatches = []

  colors.forEach((entry, index) => {
    const color = entry.color || {}

    if (color.alpha === 0) {
      return
    }

    const hex = entry.hex || rgbToHex(color)
    const hexKey = normalizeHex(hex)
    const gradient = entry.gradient && normalizeGradient(entry.gradient, color).enabled ? entry.gradient : null

    if (gradient) {
      swatches.push({ hexKey, hex, color: { ...color, alpha: 1 }, gradient, count: 1, firstIndex: index, dedicated: true, entryIndexes: [index] })
      return
    }

    const existing = swatches.find(item => item.hexKey === hexKey && !item.dedicated)

    if (existing) {
      existing.count += 1
      existing.entryIndexes.push(index)
      return
    }

    swatches.push({ hexKey, hex, color: { ...color, alpha: 1 }, gradient: null, count: 1, firstIndex: index, dedicated: false, entryIndexes: [index] })
  })

  return swatches
}

const buildNeutralFamily = (swatches) => {
  const white = swatches.find(item => item.hexKey === '#FFFFFF' && !item.dedicated)
  const black = swatches.find(item => item.hexKey === '#000000' && !item.dedicated)

  return {
    key: 'neutral',
    name: 'Neutral',
    locked: true,
    light: white ? swatchSlot(white) : { hex: '#ffffff', color: { red: 255, green: 255, blue: 255, alpha: 1 } },
    dark: black ? swatchSlot(black) : { hex: '#000000', color: { red: 0, green: 0, blue: 0, alpha: 1 } }
  }
}

const sortSwatches = swatches => [...swatches].sort((a, b) => (b.count - a.count) || (a.firstIndex - b.firstIndex))

const findPairedLight = (dark, lights, paired) => {
  const darkHue = hueOf(dark.color)

  if (darkHue === null || chromaOf(dark.color) < minPairingChroma) {
    return null
  }

  let match = null
  let matchDistance = Infinity

  lights.forEach((light) => {
    if (paired.has(light) || light.dedicated) {
      return
    }

    const lightHue = hueOf(light.color)

    if (lightHue === null || chromaOf(light.color) < minPairingChroma) {
      return
    }

    const distance = hueDistance(darkHue, lightHue)

    if (distance <= huePairingWindow && distance < matchDistance) {
      match = light
      matchDistance = distance
    }
  })

  return match
}

const buildSchemeFamilies = (swatches) => {
  const chromatic = swatches.filter(item => item.hexKey !== '#FFFFFF' && item.hexKey !== '#000000')
  const lights = chromatic.filter(item => !isDarkColor(item))
  const paired = new Set()
  const pairs = new Map()

  sortSwatches(chromatic.filter(item => isDarkColor(item) && !item.dedicated)).forEach((dark) => {
    const light = findPairedLight(dark, lights, paired)

    if (light) {
      paired.add(light)
      pairs.set(dark, light)
    }
  })

  const families = []
  const refsByHexKey = {}
  const refsByEntryIndex = {}
  const registerSlotRef = (swatch, ref) => {
    swatch.entryIndexes.forEach((entryIndex) => {
      refsByEntryIndex[entryIndex] = ref
    })

    if (!swatch.dedicated && !refsByHexKey[swatch.hexKey]) {
      refsByHexKey[swatch.hexKey] = ref
    }
  }

  sortSwatches(chromatic).forEach((swatch) => {
    if (paired.has(swatch) && !pairs.has(swatch)) {
      return
    }

    const index = families.length
    const familyKey = familyKeyAt(index)
    const variant = isDarkColor(swatch) ? 'dark' : 'light'
    const counterpartVariant = variant === 'dark' ? 'light' : 'dark'
    const pairedLight = pairs.get(swatch) || null
    const family = {
      key: familyKey,
      name: familyNameAt(index),
      [variant]: swatchSlot(swatch),
      [counterpartVariant]: pairedLight ? swatchSlot(pairedLight) : autoCounterpartSlot(swatch.color, counterpartVariant)
    }

    families.push({ key: family.key, name: family.name, light: family.light, dark: family.dark })
    registerSlotRef(swatch, formatSlotRef(familyKey, variant))

    if (pairedLight) {
      registerSlotRef(pairedLight, formatSlotRef(familyKey, counterpartVariant))
    }
  })

  return { families, refsByHexKey, refsByEntryIndex }
}

const withRequiredAssignments = (assignments = {}) => {
  const next = { ...assignments }

  next['titles-light'] = next['titles-light'] || next.primary || formatSlotRef('neutral', 'dark')
  next['titles-dark'] = next['titles-dark'] || formatSlotRef('neutral', 'light')
  next['btn-background'] = next['btn-background'] || next.accent || next.primary
  next['btn-text'] = next['btn-text'] || formatSlotRef('neutral', 'light')
  next['btn-hover-background'] = next['btn-hover-background'] || transparentSlotRef
  next['btn-hover-text'] = next['btn-hover-text'] || next.text || next.primary
  next['header-footer'] = next['header-footer'] || next.secondary || next.primary
  next['popup-background'] = next['popup-background'] || formatSlotRef('neutral', 'light')
  next['popup-titles'] = next['popup-titles'] || next['titles-light'] || formatSlotRef('neutral', 'dark')
  next['popup-text'] = next['popup-text'] || next.text || formatSlotRef('neutral', 'dark')

  return next
}

export const ensureThemeScheme = (theme) => {
  if (!theme || !Array.isArray(theme.colors)) {
    return theme
  }

  const normalizedTheme = ensureSemanticColors(theme)

  if (Array.isArray(normalizedTheme.scheme) && normalizedTheme.scheme.length && normalizedTheme.assignments) {
    return {
      ...normalizedTheme,
      assignments: withRequiredAssignments(normalizedTheme.assignments),
      sectionOverrides: normalizedTheme.sectionOverrides || {}
    }
  }

  const baseColors = normalizedTheme.colors.filter(entry => !derivedRoleLabels.includes(entry.label))
  const swatches = collectSwatches(baseColors)
  const neutral = buildNeutralFamily(swatches)
  const { families, refsByHexKey, refsByEntryIndex } = buildSchemeFamilies(swatches)
  const scheme = [neutral, ...families]

  refsByHexKey['#FFFFFF'] = refsByHexKey['#FFFFFF'] || formatSlotRef('neutral', 'light')
  refsByHexKey['#000000'] = refsByHexKey['#000000'] || formatSlotRef('neutral', 'dark')

  const assignments = {}

  baseColors.forEach((entry, index) => {
    const roleKey = entry.label === 'headers' ? 'titles-light' : entry.label
    const color = entry.color || {}

    if (color.alpha === 0) {
      assignments[roleKey] = transparentSlotRef
      return
    }

    const hexKey = normalizeHex(entry.hex || rgbToHex(color))

    assignments[roleKey] = refsByEntryIndex[index] || refsByHexKey[hexKey] || formatSlotRef('neutral', 'dark')
  })

  if (!assignments['titles-dark']) {
    assignments['titles-dark'] = formatSlotRef('neutral', 'light')
  }

  return {
    ...normalizedTheme,
    scheme,
    assignments: withRequiredAssignments(assignments),
    sectionOverrides: normalizedTheme.sectionOverrides || {}
  }
}

const buildColorEntry = (entry, value) => {
  const resolved = {
    ...entry,
    color: {
      red: value.color.red,
      green: value.color.green,
      blue: value.color.blue,
      alpha: value.color.alpha
    },
    hex: value.hex
  }

  delete resolved.gradient

  if (backgroundGradientLabels.includes(entry.label) && value.gradient) {
    resolved.gradient = cloneValue(value.gradient)
  }

  return resolved
}

export const globalTitlesRoleKey = (theme) => {
  const backgroundValue = getSlotValue(theme.scheme, theme.assignments['bg-1'])

  return isDarkColor(backgroundValue) ? 'titles-dark' : 'titles-light'
}

export const resolveThemeColors = (theme) => {
  if (!theme || !Array.isArray(theme.scheme) || !theme.assignments || !Array.isArray(theme.colors)) {
    return theme
  }

  const { scheme, assignments } = theme
  const globalTitlesRole = globalTitlesRoleKey(theme)
  const colors = theme.colors
    .filter(entry => !derivedRoleLabels.includes(entry.label))
    .map((entry) => {
      const roleKey = entry.label === 'headers' ? globalTitlesRole : entry.label
      const value = getSlotValue(scheme, assignments[roleKey])

      return value ? buildColorEntry(entry, value) : { ...entry }
    })

  derivedColorRoles.forEach((role) => {
    const value = getSlotValue(scheme, assignments[role.key])

    if (value) {
      colors.push(buildColorEntry({ label: role.key, name: role.name, description: role.description }, value))
    }
  })

  return { ...theme, colors }
}

export const normalizeTheme = theme => resolveThemeColors(ensureThemeScheme(theme))

const setStyleColorVar = (style, label, value) => {
  if (!value) {
    return
  }

  const color = { alpha: 1, ...value.color }

  style[`--${label}`] = `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha})`
  style[`--${label}-rgb`] = `${color.red}, ${color.green}, ${color.blue}`
}

const sectionButtonRoles = [
  'btn-background',
  'btn-text',
  'btn-hover-background',
  'btn-hover-text'
]

export const buildSectionStyleVars = (theme, sectionKey, sectionBgLabel) => {
  if (!theme || !Array.isArray(theme.scheme) || !theme.assignments) {
    return {}
  }

  const { scheme, assignments } = theme
  const overrides = (theme.sectionOverrides || {})[sectionKey] || {}
  const style = {}
  const backgroundRef = overrides.background || assignments[sectionBgLabel || 'bg-1']
  const backgroundValue = getSlotValue(scheme, backgroundRef)

  if (overrides.background && backgroundValue) {
    style.background = slotCssValue(backgroundValue)
    setStyleColorVar(style, 'bg-1', backgroundValue)
    setStyleColorVar(style, 'bg-2', backgroundValue)
  }

  const titlesRef = overrides.titles

  if (titlesRef) {
    setStyleColorVar(style, 'headers', getSlotValue(scheme, titlesRef))
  }

  if (overrides.text) {
    const textValue = getSlotValue(scheme, overrides.text)

    setStyleColorVar(style, 'text', textValue)

    if (textValue) {
      style.color = `rgba(${textValue.color.red}, ${textValue.color.green}, ${textValue.color.blue}, ${textValue.color.alpha})`
    }
  }

  sectionButtonRoles.forEach((role) => {
    if (!overrides[role]) {
      return
    }

    const buttonValue = getSlotValue(scheme, overrides[role])

    setStyleColorVar(style, role, buttonValue)
    setStyleColorVar(style, `section-${role}`, buttonValue)
  })

  return style
}

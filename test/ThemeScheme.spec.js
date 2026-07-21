import themeData from '~/data/theme.json'
import storeMutations from '~/store/storeMutations'
import { UPDATE_SCHEME_COLOR } from '~/store/mutation-types'
import { buildSectionStyleVars, normalizeTheme, parseSlotRef, slotCssValue, getSlotValue } from '~/resources/theme-scheme'

const presetNames = ['default', 'secondary', 'tertiary', 'quaternary']

describe('theme scheme normalization', () => {
  test.each(presetNames)('preserves the existing %s preset', (presetName) => {
    const source = themeData[presetName]
    const normalized = normalizeTheme(source)

    source.colors.forEach((sourceColor) => {
      const normalizedColor = normalized.colors.find(color => color.label === sourceColor.label)

      expect(normalizedColor).toBeDefined()
      expect(normalizedColor.hex).toBe(sourceColor.hex)
      expect(normalizedColor.color).toEqual(sourceColor.color)
      expect(normalizedColor.accessibility).toEqual(sourceColor.accessibility)
    })

    expect(normalized.typography).toEqual(source.typography)
    expect(normalized.logo_url).toBe(source.logo_url)
    expect(normalized.logo_config).toEqual(source.logo_config)
    expect(normalized.favicon_url).toBe(source.favicon_url)
    expect(normalized.scheme.length).toBeGreaterThan(1)
    expect(normalized.assignments).toEqual(expect.objectContaining({
      'titles-light': expect.any(String),
      primary: expect.any(String),
      secondary: expect.any(String),
      accent: expect.any(String),
      text: expect.any(String),
      'btn-background': expect.any(String),
      'btn-text': expect.any(String),
      'btn-hover-background': 'transparent',
      'btn-hover-text': expect.any(String),
      'header-footer': expect.any(String),
      'bg-1': expect.any(String),
      'bg-2': expect.any(String),
      'topbar-light': expect.any(String),
      'topbar-dark': expect.any(String)
    }))
    expect(normalized.colors).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: 'headers' }),
      expect.objectContaining({ label: 'btn-background' }),
      expect.objectContaining({ label: 'btn-text' }),
      expect.objectContaining({ label: 'btn-hover-background' }),
      expect.objectContaining({ label: 'btn-hover-text' }),
      expect.objectContaining({ label: 'header-footer' })
    ]))
    expect(normalized.sectionOverrides).toEqual({})
  })

  test('builds scoped variables for a single section override', () => {
    const theme = normalizeTheme(themeData.default)
    const sectionKey = '/::hero-0'
    const overrides = {
      background: theme.assignments.secondary,
      titles: theme.assignments.text,
      text: theme.assignments.primary,
      'btn-background': theme.assignments.secondary,
      'btn-text': theme.assignments['btn-text'],
      'btn-hover-background': theme.assignments['btn-hover-background'],
      'btn-hover-text': theme.assignments['btn-hover-text']
    }
    const scopedTheme = {
      ...theme,
      sectionOverrides: { [sectionKey]: overrides }
    }
    const style = buildSectionStyleVars(scopedTheme, sectionKey, null)

    expect(style.background).toBe(slotCssValue(getSlotValue(theme.scheme, overrides.background)))
    expect(style['--headers']).toBeDefined()
    expect(style['--text']).toBeDefined()
    expect(style['--btn-background']).toBeDefined()
    expect(style['--section-btn-background']).toBeDefined()
    expect(style['--btn-text']).toBeDefined()
    expect(style['--section-btn-text']).toBeDefined()
    expect(style['--btn-hover-background']).toBe('rgba(255, 255, 255, 0)')
    expect(style['--section-btn-hover-background']).toBe('rgba(255, 255, 255, 0)')
    expect(style['--btn-hover-text']).toBeDefined()
    expect(style['--section-btn-hover-text']).toBeDefined()
    expect(buildSectionStyleVars(scopedTheme, '/::hero-1', null)).not.toHaveProperty('background')
    expect(buildSectionStyleVars(theme, sectionKey, 'bg-2')).not.toHaveProperty('--headers')
  })

  test('resolves a scheme slot edit into assigned site colors', () => {
    const mutations = storeMutations()
    const state = { theme: normalizeTheme(themeData.default) }
    const primaryRef = state.theme.assignments.primary
    const parsedRef = parseSlotRef(primaryRef)

    mutations[UPDATE_SCHEME_COLOR](state, {
      familyKey: parsedRef.familyKey,
      variant: parsedRef.variant,
      patch: {
        hex: '#123456',
        color: { red: 18, green: 52, blue: 86, alpha: 1 }
      }
    })

    const primary = state.theme.colors.find(color => color.label === 'primary')

    expect(primary.hex).toBe('#123456')
    expect(primary.color).toEqual({ red: 18, green: 52, blue: 86, alpha: 1 })
  })
})

import {
  DEV_INSPECTOR,
  DEV_TOOLS,
  SET_ACTIVE_THEME_NAME,
  SET_DEFAULT_THEME,
  SET_SECONDARY_THEME,
  SET_THEME,
  SET_THEME_PRESET,
  SET_THEME_PRESETS,
  UPDATE_THEME_COLOR,
  UPDATE_SCHEME_COLOR,
  SET_SCHEME_ASSIGNMENT,
  SET_SECTION_OVERRIDE,
  SET_CUSTOMIZATION_ENABLED,
  SET_ACTIVE_BUILDER_PANEL,
  INITIALIZE_CONTENT_PAGE,
  SET_ACTIVE_CONTENT_PAGE,
  SET_ACTIVE_CONTENT_SECTION,
  SET_CONTENT_PAGE,
  ADD_CONTENT_SECTION,
  DUPLICATE_CONTENT_SECTION,
  MOVE_CONTENT_SECTION,
  REMOVE_CONTENT_SECTION,
  UPDATE_CONTENT_SECTION,
  RESTORE_DEFAULT_THEME,
  IS_PHONE_LAND_LG,
  IS_PHONE_LG,
  IS_TABLET,
  IS_TABLET_LG,
  IS_TABLET_MD,
  SET_FORMS,
  SET_BLOG,
  SET_GLOBAL,
  VIDEO_LOADING,
  VIEW_SITE,
  PAGE_CHANGE,
  SET_NAV
} from './mutation-types.js'
import { normalizeTheme, resolveThemeColors } from '~/resources/theme-scheme'

const cloneTheme = theme => JSON.parse(JSON.stringify(theme))

const stateMutations = () => ({
  [DEV_INSPECTOR] (state, data) {
    state.devInspector = data
  },
  [DEV_TOOLS] (state, data) {
    state.devTools = data
  },
  [SET_ACTIVE_THEME_NAME] (state, data) {
    state.activeThemeName = data
  },
  [SET_DEFAULT_THEME] (state, data) {
    state.defaultTheme = normalizeTheme(cloneTheme(data))
  },
  [SET_SECONDARY_THEME] (state, data) {
    state.secondaryTheme = normalizeTheme(cloneTheme(data))
  },
  [SET_THEME] (state, data) {
    state.theme = normalizeTheme(cloneTheme(data))
  },
  [SET_THEME_PRESET] (state, data) {
    state.themePresets = {
      ...state.themePresets,
      [data.name]: normalizeTheme(cloneTheme(data.theme))
    }
  },
  [SET_THEME_PRESETS] (state, data) {
    const presets = cloneTheme(data)

    Object.keys(presets).forEach((name) => {
      presets[name] = normalizeTheme(presets[name])
    })

    state.themePresets = presets
  },
  [UPDATE_THEME_COLOR] (state, data) {
    if (!state.theme || !state.theme.colors) {
      return
    }

    state.theme = {
      ...state.theme,
      colors: state.theme.colors.map((color) => {
        if (color.label !== data.label) {
          return color
        }

        return {
          ...color,
          ...data,
          color: {
            ...color.color,
            ...data.color
          }
        }
      })
    }
  },
  [UPDATE_SCHEME_COLOR] (state, data) {
    if (!state.theme || !Array.isArray(state.theme.scheme)) {
      return
    }

    const scheme = state.theme.scheme.map((family) => {
      if (family.key !== data.familyKey || !family[data.variant]) {
        return family
      }

      const slot = family[data.variant]

      return {
        ...family,
        [data.variant]: {
          ...slot,
          ...data.patch,
          color: {
            ...slot.color,
            ...data.patch.color
          }
        }
      }
    })

    state.theme = resolveThemeColors(cloneTheme({ ...state.theme, scheme }))
  },
  [SET_SCHEME_ASSIGNMENT] (state, data) {
    if (!state.theme || !state.theme.assignments) {
      return
    }

    state.theme = resolveThemeColors(cloneTheme({
      ...state.theme,
      assignments: {
        ...state.theme.assignments,
        [data.role]: data.slotRef
      }
    }))
  },
  [SET_SECTION_OVERRIDE] (state, data) {
    if (!state.theme) {
      return
    }

    const sectionOverrides = cloneTheme(state.theme.sectionOverrides || {})
    const section = { ...sectionOverrides[data.sectionKey] }

    if (data.slotRef) {
      section[data.role] = data.slotRef
    } else {
      delete section[data.role]
    }

    if (Object.keys(section).length) {
      sectionOverrides[data.sectionKey] = section
    } else {
      delete sectionOverrides[data.sectionKey]
    }

    state.theme = {
      ...state.theme,
      sectionOverrides
    }
  },
  [SET_CUSTOMIZATION_ENABLED] (state, data) {
    state.customizationEnabled = !!data
  },
  [SET_ACTIVE_BUILDER_PANEL] (state, data) {
    state.activeBuilderPanel = data || null
  },
  [INITIALIZE_CONTENT_PAGE] (state, data) {
    if (!data || !data.key || state.contentPages[data.key]) {
      return
    }

    const baseline = cloneTheme(data.page)
    const page = data.draft ? cloneTheme(data.draft) : cloneTheme(data.page)

    state.contentBaselines = { ...state.contentBaselines, [data.key]: baseline }
    state.contentPages = { ...state.contentPages, [data.key]: page }
  },
  [SET_ACTIVE_CONTENT_PAGE] (state, data) {
    state.activeContentPageKey = data || null
    state.activeContentSectionId = null
  },
  [SET_ACTIVE_CONTENT_SECTION] (state, data) {
    state.activeContentSectionId = data || null
  },
  [SET_CONTENT_PAGE] (state, data) {
    if (!data || !data.key || !data.page) {
      return
    }

    state.contentPages = {
      ...state.contentPages,
      [data.key]: cloneTheme(data.page)
    }
  },
  [ADD_CONTENT_SECTION] (state, data) {
    const page = state.contentPages[data.key]

    if (!page || !data.section) {
      return
    }

    const sections = [...page.sections, cloneTheme(data.section)]

    state.contentPages = { ...state.contentPages, [data.key]: { ...page, sections } }
    state.activeContentSectionId = data.section.__builder_id
  },
  [DUPLICATE_CONTENT_SECTION] (state, data) {
    const page = state.contentPages[data.key]
    const index = page ? page.sections.findIndex(section => section.__builder_id === data.id) : -1

    if (index < 0 || !data.section) {
      return
    }

    const sections = [...page.sections]
    sections.splice(index + 1, 0, cloneTheme(data.section))
    state.contentPages = { ...state.contentPages, [data.key]: { ...page, sections } }
    state.activeContentSectionId = data.section.__builder_id
  },
  [MOVE_CONTENT_SECTION] (state, data) {
    const page = state.contentPages[data.key]
    const index = page ? page.sections.findIndex(section => section.__builder_id === data.id) : -1
    const nextIndex = index + data.direction

    if (index < 0 || nextIndex < 0 || nextIndex >= page.sections.length) {
      return
    }

    const sections = [...page.sections]
    const section = sections.splice(index, 1)[0]
    sections.splice(nextIndex, 0, section)
    state.contentPages = { ...state.contentPages, [data.key]: { ...page, sections } }
  },
  [REMOVE_CONTENT_SECTION] (state, data) {
    const page = state.contentPages[data.key]

    if (!page) {
      return
    }

    const sections = page.sections.filter(section => section.__builder_id !== data.id)
    state.contentPages = { ...state.contentPages, [data.key]: { ...page, sections } }

    if (state.activeContentSectionId === data.id) {
      state.activeContentSectionId = null
    }
  },
  [UPDATE_CONTENT_SECTION] (state, data) {
    const page = state.contentPages[data.key]

    if (!page) {
      return
    }

    const sections = page.sections.map(section => section.__builder_id === data.id
      ? { ...section, ...cloneTheme(data.patch) }
      : section)

    state.contentPages = { ...state.contentPages, [data.key]: { ...page, sections } }
  },
  [RESTORE_DEFAULT_THEME] (state) {
    if (!state.defaultTheme) {
      return
    }

    state.theme = cloneTheme(state.defaultTheme)
  },
  [IS_PHONE_LAND_LG] (state, data) {
    state.isPhoneLandLg = data
  },
  [IS_PHONE_LG] (state, data) {
    state.isPhoneLg = data
  },
  [IS_TABLET] (state, data) {
    state.isTablet = data
  },
  [IS_TABLET_LG] (state, data) {
    state.isTabletLg = data
  },
  [IS_TABLET_MD] (state, data) {
    state.isTabletMd = data
  },
  [SET_FORMS] (state, data) {
    state.forms = data
  },
  [SET_BLOG] (state, data) {
    state.posts = data
  },
  [SET_GLOBAL] (state, data) {
    state.global = data
  },
  [VIDEO_LOADING] (state, data) {
    state.videoIsLoading = data
  },
  [VIEW_SITE] (state, data) {
    state.siteLoaded = data
  },
  [PAGE_CHANGE] (state, data) {
    state.changing = data
  },
  [SET_NAV] (state, data) {
    state.noFloatTop = data
  }
})

export default stateMutations

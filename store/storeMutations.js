import {
  DEV_INSPECTOR,
  DEV_TOOLS,
  SET_ACTIVE_THEME_NAME,
  SET_DEFAULT_THEME,
  SET_SECONDARY_THEME,
  SET_THEME,
  UPDATE_THEME_COLOR,
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
    state.defaultTheme = cloneTheme(data)
  },
  [SET_SECONDARY_THEME] (state, data) {
    state.secondaryTheme = cloneTheme(data)
  },
  [SET_THEME] (state, data) {
    state.theme = cloneTheme(data)
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

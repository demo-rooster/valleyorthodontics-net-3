<template src='./default.pug' lang='pug'></template>

<script>
import { getCustomPosts, getForms, setJSONData, getThemeJSON } from '~/resources/utils'
import DevModeBanner from '~/components/dev-mode/dev-mode-banner'
import Popup from '~/components/popup'
import SkipLink from '~/components/base/base-skip-link'
import TheFooter from '~/components/footer'
import TheNavigation from '~/components/navigation'
import BaseAccess from '~/components/base/base-access'
import CustomizationToolbar from '~/components/customization-toolbar'

const activeThemeStorageKey = 'rg-active-theme-v3'
const themePresetNames = ['primary', 'secondary', 'tertiary', 'quaternary']
const themePresetsStorageKey = 'rg-theme-presets-v1'
const themePresetsStorageVersion = 'theme-presets-data-1'
const cloneTheme = theme => JSON.parse(JSON.stringify(theme))

export default {
  components: {
    BaseAccess,
    DevModeBanner,
    Popup,
    SkipLink,
    CustomizationToolbar,
    TheFooter,
    TheNavigation
  },
  data: () => ({
    forms: null,
    posts: null,
    global: null,
    popupActive: false,
    showDevModeBanner: false
  }),
  computed: {
    theme () {
      return this.$store.state.theme
    }
  },
  watch: {
    $route: 'onRouteChange',
    theme: {
      handler () {
        this.updateGlobalStyles()
      },
      deep: true
    }
  },
  async fetch () {
    this.forms = await getForms()
    this.posts = await getCustomPosts('posts', 2)
    this.global = await setJSONData('global', 'globalData')
    const theme = await getThemeJSON()
    const themePresets = this.getThemePresets(theme)

    this.$store.dispatch('SET_DEFAULT_THEME', themePresets.primary)
    this.$store.dispatch('SET_SECONDARY_THEME', themePresets.secondary)
    this.$store.dispatch('SET_THEME_PRESETS', themePresets)
    this.$store.dispatch('SET_THEME', cloneTheme(themePresets.secondary))
    this.$store.dispatch('SET_BLOG', this.posts)
    this.$store.dispatch('SET_GLOBAL', this.global)
    this.$store.dispatch('SET_FORMS', this.forms)
  },
  mounted () {
    this.applyStoredThemePreset()
    this.updateGlobalStyles()
    this.checkWindowWidth()

    if (this.$route.path === '/' && this.global.enable_popup) {
      this.popupActive = true
    }

    this.showDevModeBanner = process.env.NODE_ENV === 'development' && this.global.enable_development_mode

    window.addEventListener('resize', () => {
      this.checkWindowWidth()
    })
  },
  methods: {
    checkWindowWidth () {
      this.$nextTick(() => {
        this.$store.dispatch('IS_PHONE_LAND_LG', window.innerWidth <= 900 && window.innerHeight <= 480)
        this.$store.dispatch('IS_PHONE_LG', window.innerWidth <= 480)
        this.$store.dispatch('IS_TABLET', window.innerWidth <= 768)
        this.$store.dispatch('IS_TABLET_MD', window.innerWidth <= 880)
        this.$store.dispatch('IS_TABLET_LG', window.innerWidth <= 1024)
      })
    },
    onRouteChange () {
      const target = document.querySelector('#page-wrapper')
      target.focus()
    },
    getThemePresets (theme) {
      return themePresetNames.reduce((presets, name) => {
        const themeKey = name === 'primary' ? 'default' : name
        presets[name] = cloneTheme(theme[themeKey] || theme.default)
        return presets
      }, {})
    },
    applyStoredThemePreset () {
      if (!this.$store.state.themePresets.primary) {
        return
      }

      const themePresets = this.getStoredThemePresets(this.$store.state.themePresets)
      const storedActiveThemeName = window.localStorage.getItem(activeThemeStorageKey)
      const activeThemeName = themePresets[storedActiveThemeName] ? storedActiveThemeName : 'secondary'

      this.$store.dispatch('SET_THEME_PRESETS', themePresets)
      this.$store.dispatch('SET_DEFAULT_THEME', themePresets.primary)
      this.$store.dispatch('SET_SECONDARY_THEME', themePresets.secondary)
      this.$store.dispatch('SET_ACTIVE_THEME_NAME', activeThemeName)
      this.$store.dispatch('SET_THEME', themePresets[activeThemeName])
    },
    getStoredThemePresets (basePresets) {
      const savedThemePresets = this.getStoredTheme(themePresetsStorageKey)

      if (savedThemePresets) {
        if (savedThemePresets.version === themePresetsStorageVersion) {
          return themePresetNames.reduce((presets, name) => {
            presets[name] = savedThemePresets.presets && savedThemePresets.presets[name]
              ? this.mergeStoredThemeColors(basePresets[name], savedThemePresets.presets[name])
              : cloneTheme(basePresets[name])
            return presets
          }, {})
        }

        window.localStorage.removeItem(themePresetsStorageKey)
      }

      return cloneTheme(basePresets)
    },
    getStoredTheme (storageKey) {
      const storedTheme = window.localStorage.getItem(storageKey)

      if (!storedTheme) {
        return null
      }

      try {
        return JSON.parse(storedTheme)
      } catch (error) {
        window.localStorage.removeItem(storageKey)
        return null
      }
    },
    mergeStoredThemeColors (baseTheme, storedTheme) {
      const storedColors = Array.isArray(storedTheme.colors)
        ? storedTheme.colors
        : Object.keys(storedTheme).map(label => ({ label, ...storedTheme[label] }))

      return {
        ...cloneTheme(baseTheme),
        colors: baseTheme.colors.map((color) => {
          const storedColor = storedColors.find(item => item.label === color.label)

          if (!storedColor) {
            return color
          }

          return {
            ...color,
            ...storedColor,
            gradient: 'solid',
            color: {
              ...color.color,
              ...storedColor.color
            }
          }
        })
      }
    },
    updateGlobalStyles () {
      if (typeof document === 'undefined') {
        return
      }

      const root = document.documentElement

      // Colors
      if (this.theme && this.theme.colors) {
        this.theme.colors.forEach((color) => {
          root.style.setProperty(`--${color.label}`, this.getThemeColorValue(color))
          root.style.setProperty(`--${color.label}-rgb`, `${color.color.red}, ${color.color.green}, ${color.color.blue}`)
        })
      }

      // Typography
      if (this.theme && this.theme.typography) {
        this.theme.typography.forEach((font) => {
          root.style.setProperty(`--${font.label}`, font.font)
        })
      }
    },
    getThemeColorValue (color) {
      return `rgba(${color.color.red}, ${color.color.green}, ${color.color.blue}, ${color.color.alpha})`
    }
  }
}
</script>
<style>
  main:focus {
    outline: none;
  }
  #page-wrapper:focus {
    outline: none;
  }
  #page-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  #main-content {
    flex: 1;
  }
</style>

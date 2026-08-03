<template src='./default.pug' lang='pug'></template>

<script>
import { getCustomPosts, getForms, setJSONData, getThemeJSON } from '~/resources/utils'
import { buildGradientCss, normalizeGradient } from '~/resources/gradients'
import DevModeBanner from '~/components/dev-mode/dev-mode-banner'
import Popup from '~/components/popup'
import SkipLink from '~/components/base/base-skip-link'
import TheFooter from '~/components/footer'
import TheNavigation from '~/components/navigation'
import BaseAccess from '~/components/base/base-access'

const themePresetNames = ['primary', 'secondary', 'tertiary', 'quaternary']
const cloneTheme = theme => JSON.parse(JSON.stringify(theme))
const defaultHeaderSettings = {
  enable_top_bar: false,
  type: 'links',
  theme: 'dark',
  content_alignment: 'right',
  links: [],
  announcement: {
    icon: 'phone',
    label: '',
    text: '',
    mobile_text: '',
    open_popup: false
  }
}
const defaultPopupSettings = {
  enable_popup: false,
  pages: 'home',
  frequency: 'every',
  title: '',
  text: '',
  image: null
}
const popupSeenStorageKey = 'rg-popup-seen-v1'

export default {
  components: {
    BaseAccess,
    DevModeBanner,
    Popup,
    SkipLink,
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
    },
    popupProps () {
      return this.theme?.popup || this.global?.popup || null
    },
    popupEnabled () {
      const popup = this.theme?.popup

      if (popup) {
        return !!popup.enable_popup
      }

      return !!(this.global && this.global.enable_popup)
    },
    popupPages () {
      return this.theme?.popup?.pages || 'home'
    },
    popupFrequency () {
      return this.theme?.popup?.frequency || 'every'
    },
    popupMatchesPage () {
      return this.popupPages === 'all' || this.$route.path === '/'
    }
  },
  watch: {
    $route: 'onRouteChange',
    theme: {
      handler () {
        this.updateGlobalStyles()
      },
      deep: true
    },
    popupEnabled: 'refreshPopupPreview',
    popupPages: 'refreshPopupPreview'
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
    this.$store.dispatch('SET_ACTIVE_THEME_NAME', 'primary')
    this.$store.dispatch('SET_THEME', cloneTheme(themePresets.primary))
    this.$store.dispatch('SET_BLOG', this.posts)
    this.$store.dispatch('SET_GLOBAL', this.global)
    this.$store.dispatch('SET_FORMS', this.forms)
  },
  mounted () {
    this.updateGlobalStyles()
    this.checkWindowWidth()

    if (this.popupEnabled && this.popupMatchesPage && this.popupFrequencyAllows()) {
      this.popupActive = true
      window.localStorage.setItem(popupSeenStorageKey, 'true')
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
    popupFrequencyAllows () {
      if (this.popupFrequency !== 'first') {
        return true
      }

      return !window.localStorage.getItem(popupSeenStorageKey)
    },
    refreshPopupPreview () {
      this.popupActive = this.popupEnabled && this.popupMatchesPage
    },
    getThemePresets (theme) {
      return themePresetNames.reduce((presets, name) => {
        const themeKey = name === 'primary' ? 'default' : name
        const preset = cloneTheme(theme[themeKey] || theme.default)

        if (!preset.header) {
          preset.header = cloneTheme(this.global?.top_bar || defaultHeaderSettings)
        }

        if (preset.header.announcement && preset.header.announcement.open_popup === undefined) {
          const modal = preset.header.announcement.modal || {}
          preset.header.announcement.open_popup = !!(modal.title || modal.text)
        }

        if (!preset.popup) {
          preset.popup = {
            enable_popup: !!this.global?.enable_popup,
            ...cloneTheme(this.global?.popup || defaultPopupSettings)
          }
        }

        if (preset.popup.pages === undefined) {
          preset.popup.pages = defaultPopupSettings.pages
        }

        if (preset.popup.frequency === undefined) {
          preset.popup.frequency = defaultPopupSettings.frequency
        }

        presets[name] = preset
        return presets
      }, {})
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
      const gradient = normalizeGradient(color.gradient, color.color)

      if (gradient.enabled) {
        return buildGradientCss(gradient)
      }

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

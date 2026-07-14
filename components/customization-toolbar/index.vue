<template lang='pug' src='./index.pug'></template>

<script>
const activeThemeStorageKey = 'rg-active-theme'
const secondaryThemeStorageKey = 'rg-secondary-theme'
const backgroundColorLabels = ['bg-1', 'bg-2']

export default {
  data: () => ({
    isOpen: false,
    copiedColor: null,
    gradientOptions: [
      { label: 'Solid', value: 'solid' },
      { label: 'Radial mist', value: 'radialMist' },
      { label: 'Corner bloom', value: 'cornerBloom' },
      { label: 'Soft halo', value: 'softHalo' },
      { label: 'Linear wash', value: 'linearWash' },
      { label: 'Linear lift', value: 'linearLift' }
    ]
  }),
  computed: {
    themeColors () {
      return this.$store.state.theme?.colors || []
    },
    activeThemeName () {
      return this.$store.state.activeThemeName
    }
  },
  methods: {
    toggleToolbar () {
      this.isOpen = !this.isOpen
    },
    colorInputId (color) {
      return `customization-toolbar-${color.label}`
    },
    colorValue (color) {
      if (color.hex) {
        return this.normalizeHex(color.hex)
      }

      return this.rgbToHex(color.color)
    },
    handleColorInput (color, value) {
      const rgb = this.hexToRgb(value)

      if (!rgb) {
        return
      }

      const updatedColor = {
        ...color,
        hex: this.normalizeHex(value),
        color: {
          ...color.color,
          red: rgb.red,
          green: rgb.green,
          blue: rgb.blue,
          alpha: color.color?.alpha || 1
        }
      }

      this.$store.dispatch('UPDATE_THEME_COLOR', updatedColor)
      this.saveSecondaryTheme()
    },
    handleGradientInput (color, value) {
      const updatedColor = {
        ...color,
        gradient: value
      }

      this.$store.dispatch('UPDATE_THEME_COLOR', updatedColor)
      this.saveSecondaryTheme()
    },
    isBackgroundColor (color) {
      return backgroundColorLabels.includes(color.label)
    },
    gradientValue (color) {
      return color.gradient || 'solid'
    },
    copyThemeColor (color) {
      this.copiedColor = {
        label: color.label,
        hex: this.colorValue(color)
      }
    },
    applyCopiedColor (color) {
      if (!this.copiedColor) {
        return
      }

      this.handleColorInput(color, this.copiedColor.hex)
    },
    copyButtonLabel (color) {
      return `Copy ${color.label} color`
    },
    applyButtonLabel (color) {
      if (!this.copiedColor) {
        return `Copy a color before applying to ${color.label}`
      }

      return `Apply ${this.copiedColor.label} color to ${color.label}`
    },
    setPrimaryTheme () {
      if (!this.$store.state.defaultTheme) {
        return
      }

      window.localStorage.setItem(activeThemeStorageKey, 'primary')
      this.$store.dispatch('SET_ACTIVE_THEME_NAME', 'primary')
      this.$store.dispatch('SET_THEME', this.$store.state.defaultTheme)
    },
    setSecondaryTheme () {
      if (!this.$store.state.secondaryTheme) {
        return
      }

      window.localStorage.setItem(activeThemeStorageKey, 'secondary')
      this.$store.dispatch('SET_ACTIVE_THEME_NAME', 'secondary')
      this.$store.dispatch('SET_THEME', this.$store.state.secondaryTheme)
    },
    saveSecondaryTheme () {
      if (!this.$store.state.theme) {
        return
      }

      const theme = this.$store.state.theme

      window.localStorage.setItem(secondaryThemeStorageKey, JSON.stringify({ colors: theme.colors }))
      window.localStorage.setItem(activeThemeStorageKey, 'secondary')
      this.$store.dispatch('SET_SECONDARY_THEME', theme)
      this.$store.dispatch('SET_ACTIVE_THEME_NAME', 'secondary')
    },
    normalizeHex (hex) {
      const value = hex.charAt(0) === '#' ? hex : `#${hex}`
      return value.toUpperCase()
    },
    hexToRgb (hex) {
      const value = this.normalizeHex(hex).replace('#', '')

      if (!/^[0-9A-F]{6}$/i.test(value)) {
        return null
      }

      const colorValue = parseInt(value, 16)

      return {
        red: (colorValue >> 16) & 255,
        green: (colorValue >> 8) & 255,
        blue: colorValue & 255
      }
    },
    rgbToHex (color = {}) {
      const red = this.toHexChannel(color.red)
      const green = this.toHexChannel(color.green)
      const blue = this.toHexChannel(color.blue)

      return `#${red}${green}${blue}`.toUpperCase()
    },
    toHexChannel (value = 0) {
      const channel = Math.max(0, Math.min(255, value))
      return channel.toString(16).padStart(2, '0')
    }
  }
}
</script>

<style lang='sass' src='./index.sass'></style>

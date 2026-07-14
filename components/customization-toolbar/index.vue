<template lang='pug' src='./index.pug'></template>

<script>
const activeThemeStorageKey = 'rg-active-theme-v3'
const themePresetNames = ['primary', 'secondary', 'tertiary', 'quaternary']
const themePresetsStorageKey = 'rg-theme-presets-v1'
const themePresetsStorageVersion = 'theme-presets-data-1'
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
    },
    activeThemeLabel () {
      return this.themePresetLabel(this.activeThemeName)
    },
    themePresetButtons () {
      return themePresetNames.map(name => ({
        name,
        label: this.themePresetLabel(name)
      }))
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
      this.saveActiveThemePreset()
    },
    handleGradientInput (color, value) {
      const updatedColor = {
        ...color,
        gradient: value
      }

      this.$store.dispatch('UPDATE_THEME_COLOR', updatedColor)
      this.saveActiveThemePreset()
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
    setThemePreset (name) {
      if (!this.$store.state.themePresets[name]) {
        return
      }

      window.localStorage.setItem(activeThemeStorageKey, name)
      this.$store.dispatch('SET_ACTIVE_THEME_NAME', name)
      this.$store.dispatch('SET_THEME', this.$store.state.themePresets[name])
    },
    saveActiveThemePreset () {
      if (!this.$store.state.theme) {
        return
      }

      const theme = this.$store.state.theme
      const themePresets = {
        ...this.$store.state.themePresets,
        [this.activeThemeName]: theme
      }

      window.localStorage.setItem(themePresetsStorageKey, JSON.stringify({ version: themePresetsStorageVersion, presets: themePresets }))
      window.localStorage.setItem(activeThemeStorageKey, this.activeThemeName)
      this.$store.dispatch('SET_THEME_PRESET', { name: this.activeThemeName, theme })
    },
    themePresetLabel (name) {
      return `${name.charAt(0).toUpperCase()}${name.slice(1)} theme`
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

<template lang="pug" src="./index.pug" ></template>

<script>
import { getThemeJSON } from '~/resources/utils'

export default {
  props: {
    props: {
      type: Object,
      default: () => ({})
    },
    variant: {
      type: String,
      default: 'primary'
    }
  },
  computed: {
    themeColor () {
      const theme = getThemeJSON()
      const colors = theme.default?.colors || []
      return colors.find(c => c.label === this.variant) || colors.find(c => c.label === 'primary')
    },
    textColor () {
      return this.themeColor?.hex || '#272727'
    },
    buttonStyles () {
      return { '--caretBtnClr': this.textColor }
    }
  },
  methods: {
    onClick () {
      this.$emit('onClick')
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

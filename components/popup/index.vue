<template lang="pug" src="./index.pug"></template>

<script>
import { bodyScroll } from '~/resources/mixins'

export default {
  mixins: [bodyScroll],
  props: {
    props: {
      type: Object,
      default: () => ({})
    }
  },
  data: () => ({
    popupActive: false
  }),
  mounted () {
    this.$_stopBodyScroll()
    this.popupActive = true
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

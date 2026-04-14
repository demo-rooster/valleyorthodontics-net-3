<template lang='pug' src='./index.pug'></template>

<script>
import { bodyScroll, removeFocus, trapFocus } from '~/resources/mixins'

export default {
  mixins: [
    bodyScroll,
    removeFocus,
    trapFocus
  ],
  props: {
    props: {
      type: Object,
      default: () => ({})
    }
  },
  data: () => ({
    modalOpen: false,
    windowWidth: null
  }),
  mounted () {
    this.setWindowWidth()
    window.addEventListener('resize', this.setWindowWidth)
  },
  destroyed () {
    window.removeEventListener('resize', this.setWindowWidth)
  },
  methods: {
    setWindowWidth () {
      this.windowWidth = window.innerWidth
    },
    openModal () {
      this.modalOpen = true
      this.$_stopBodyScroll()
      this.$_removeFocus()
    }
  }
}
</script>

<style lang='sass' src='./index.sass'></style>

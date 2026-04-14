<template lang='pug' src='./index.pug'></template>

<script>
import { bodyScroll, debounce, removeFocus, trapFocus } from '~/resources/mixins'

export default {
  mixins: [
    bodyScroll,
    debounce,
    removeFocus,
    trapFocus
  ],
  props: {
    modalOpen: {
      type: Boolean,
      default: false
    },
    props: {
      type: Object,
      default: () => ({})
    }
  },
  mounted () {
    this.$_trapFocus(this.$refs.modal)
    // this.setMainHeight()
    window.addEventListener('resize', this.debounceFunc)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.debounceFunc)
  },
  methods: {
    closeModal () {
      document.body.classList.remove('body-stop')
      this.$_resetBodyScroll()
      this.$_removeFocus()
      this.$emit('closemodal', false)
    },
    debounceFunc () {
      this.debounce(this.setMainHeight, null, 300)
    },
    setMainHeight () {
      this.$refs.main.style.height = this.$refs.content.clientHeight < window.innerHeight * 0.9 ? `${this.$refs.content.clientHeight}px` : `${window.innerHeight * 0.9}px`
    }
  }
}
</script>

<style lang='sass' src='./index.sass'></style>

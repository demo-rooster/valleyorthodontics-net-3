<template lang="pug" src="./index.pug"></template>

<script>
import { removeFocus } from '~/resources/mixins'

export default {
  mixins: [removeFocus],
  props: {
    props: {
      type: Object,
      default: () => ({})
    }
  },
  data: () => ({
    sliderPosition: 50,
    isDragging: false
  }),
  mounted () {
    document.addEventListener('mousemove', this.handleDrag)
    document.addEventListener('mouseup', this.stopDrag)
    document.addEventListener('touchmove', this.handleDrag, { passive: false })
    document.addEventListener('touchend', this.stopDrag)
  },
  beforeDestroy () {
    document.removeEventListener('mousemove', this.handleDrag)
    document.removeEventListener('mouseup', this.stopDrag)
    document.removeEventListener('touchmove', this.handleDrag)
    document.removeEventListener('touchend', this.stopDrag)
  },
  methods: {
    startDrag (e) {
      e.preventDefault()
      this.isDragging = true
    },
    handleDrag (e) {
      if (!this.isDragging) { return }
      e.preventDefault()

      const container = this.$refs.container
      if (!container) { return }

      const rect = container.getBoundingClientRect()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const x = clientX - rect.left
      const percentage = (x / rect.width) * 100

      this.sliderPosition = Math.max(0, Math.min(100, percentage))
    },
    stopDrag () {
      this.isDragging = false
    },
    handleKeyboard (e) {
      const step = 5
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        this.sliderPosition = Math.max(0, this.sliderPosition - step)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        this.sliderPosition = Math.min(100, this.sliderPosition + step)
      }
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

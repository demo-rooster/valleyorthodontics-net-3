<template lang="pug" src="./index.pug" ></template>

<script>
import { fadeUpIn, titleAnimation } from '~/resources/mixins'

export default {
  mixins: [fadeUpIn, titleAnimation],
  props: {
    props: {
      type: Object,
      default: () => ({})
    }
  },
  data: () => ({
    contentHeight: null,
    windowWidth: null
  }),
  mounted () {
    this.setWindowWidth()
    this.setContainerHeight()

    this.$_titleAnimation(this.$refs.fhTitle, '--barWidth')

    this.$refs.fhParagraphs.forEach((item, i) => {
      this.$_fadeUpIn(item, 40, 'bottom bottom')
    })

    window.addEventListener('resize', this.setWindowWidth)
    window.addEventListener('resize', this.setContainerHeight)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.setContainerHeight)
    window.removeEventListener('resize', this.setWindowWidth)
  },
  methods: {
    setContainerHeight () {
      if (this.windowWidth > 1024) {
        this.contentHeight = ((this.$refs.fhContent.clientHeight + 100) / 16) + 'rem'
      } else {
        this.contentHeight = ((this.$refs.fhContent.clientHeight + 32) / 16) + 'rem'
      }
    },
    setWindowWidth () {
      this.windowWidth = window.innerWidth
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

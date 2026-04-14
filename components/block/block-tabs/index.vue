<template lang="pug" src="./index.pug" ></template>

<script>
import { fadeUpIn, titleAnimation, bodyScroll } from '~/resources/mixins'
import BlockAccordion from '~/components/block/block-accordion'

export default {
  components: {
    BlockAccordion
  },
  mixins: [fadeUpIn, titleAnimation, bodyScroll],
  props: {
    props: {
      type: Object,
      default: () => ({})
    }
  },
  data: () => ({
    contentHeight: null,
    windowWidth: null,
    marginTop: 50,
    modalOpen: false,
    active: 0
  }),
  mounted () {
    this.setWindowWidth()
    this.$nextTick(() => {
      this.setImageHeight()
    })
    if (this.$refs.itTitle) {
      this.$_titleAnimation(this.$refs.itTitle, '--itBarWidth')
    }
    if (this.props.intro) {
      this.$_fadeUpIn(this.$refs.intro, 32, 'bottom bottom')
    }
    if (this.$refs.accordion) {
      this.$_fadeUpIn(this.$refs.accordion.$el, 32, 'center bottom')
    }
    window.addEventListener('resize', this.setWindowWidth)
    window.addEventListener('resize', this.setImageHeight)
  },
  beforeDestroy () {
    window.addEventListener('resize', this.setWindowWidth)
    window.removeEventListener('resize', this.setImageHeight)
  },
  methods: {
    setImageHeight () {
      if (this.windowWidth > 768 && this.$refs.contentHeight) {
        if (this.$refs.accordion) {
          setTimeout(() => {
            this.contentHeight = (this.$refs.contentHeight.clientHeight / 16) + 'rem'
          }, 200)
        } else {
          this.contentHeight = (this.$refs.contentHeight.clientHeight / 16) + 'rem'
        }
      } else {
        this.contentHeight = null
      }
    },
    setWindowWidth () {
      this.windowWidth = window.innerWidth
    },
    openModal () {
      this.$_stopBodyScroll()
      this.modalOpen = true
    },
    makeActive (i) {
      this.active = i
      // if (this.windowWidth > 768) {
      //   this.marginTop = (i + 1) * 50
      // } else {
      //   this.marginTop = 0
      // }
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

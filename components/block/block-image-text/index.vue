<template lang="pug" src="./index.pug" ></template>

<script>
import { fadeUpIn, titleAnimation, bodyScroll } from '~/resources/mixins'
import BlockAccordion from '~/components/block/block-accordion'
import BlockButton from '~/components/block/block-button'

export default {
  components: {
    BlockAccordion,
    BlockButton
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
    modalOpen: false,
    active: null
  }),
  mounted () {
    this.setWindowWidth()
    this.$nextTick(() => {
      this.setImageHeight()
      setTimeout(() => {
        this.setImageHeight()
      }, 200)
    })
    if (this.$refs.itTitle) {
      this.$_titleAnimation(this.$refs.itTitle, '--itBarWidth')
    }
    if (this.$refs.itBtns) {
      this.$_fadeUpIn(this.$refs.itBtns, 32, 'bottom bottom')
    }
    if (this.$refs.itParagraphs) {
      this.$refs.itParagraphs.forEach((item, i) => {
        this.$_fadeUpIn(item, 32, 'bottom bottom')
      })
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
    getActive (i) {
      if (this.active === i) {
        this.active = null
      } else {
        this.active = i
      }
    },
    setImageHeight () {
      if (this.windowWidth > 768 && this.$refs.contentHeight) {
        if (this.$refs.accordion) {
          setTimeout(() => {
            this.contentHeight = (this.$refs.contentHeight.clientHeight / 12) + 'rem'
          }, 200)
        } else {
          this.contentHeight = (this.$refs.contentHeight.clientHeight / 12) + 'rem'
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
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

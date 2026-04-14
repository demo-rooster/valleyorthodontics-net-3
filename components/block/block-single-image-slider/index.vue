<template lang="pug" src="./index.pug" ></template>

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
    currIndex: 0,
    maxHeight: 0,
    sliderLength: null
  }),
  mounted () {
    this.sliderLength = this.props.slides.length - 1
  },
  methods: {
    handleSlide (str) {
      if (str === 'prev') {
        this.currIndex === 0 ? this.currIndex = this.sliderLength : this.currIndex--
      }
      if (str === 'next') {
        this.currIndex === this.sliderLength ? this.currIndex = 0 : this.currIndex++
      }
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

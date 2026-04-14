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
    sliderLength: null,
    videoActive: false,
    videoPlaying: false,
    currentTitle: null
  }),
  mounted () {
    this.sliderLength = this.props.slides.length - 1
    this.currentTitle = this.props.slides[0].title || null
    if (this.$refs.videoPlayer) {
      this.$refs.videoPlayer.addEventListener('ended', (e) => {
        this.videoActive = false
        this.videoPlaying = false
      })
    }
  },
  methods: {
    handleSlide (str) {
      if (str === 'prev') {
        this.currIndex === 0 ? this.currIndex = this.sliderLength : this.currIndex--
      }
      if (str === 'next') {
        this.currIndex === this.sliderLength ? this.currIndex = 0 : this.currIndex++
      }
      this.currentTitle = this.props.slides[this.currIndex].title
    },
    playVideo () {
      if (!this.videoActive) {
        this.videoActive = true
        this.$refs.videoPlayer.setAttribute('controls', 'true')
        this.$refs.videoPlayer.play()
      }
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

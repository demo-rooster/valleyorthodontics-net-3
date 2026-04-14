<template lang="pug" src="./index.pug"></template>

<script>
export default {
  props: {
    props: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      active: 0,
      videoActive: false,
      intersectionOptions: {
        root: null,
        rootMargin: '0px 0px 0px 0px',
        threshold: [ 0.3 ]
      }
    }
  },
  methods: {
    onWaypoint ({ going, direction, el }) {
      if (going === 'in') {
        if (el.classList.contains('block-faqs__container')) {
          el.classList.add('block-faqs__container--active')
        }
      }
    },
    toggleSection (i) {
      this.active = i
      this.videoActive = false
    },
    playVideo (src) {
      this.videoActive = src
    }
  }
}
</script>

<style lang='sass' src='./index.sass'></style>

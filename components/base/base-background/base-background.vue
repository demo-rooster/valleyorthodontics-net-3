<template lang='pug' src='./base-background.pug'></template>

<script>
export default {
  props: {
    src: {
      type: String,
      default: () => ``
    },
    webp: {
      type: String,
      default: () => ``
    },
    bgColor: {
      type: String,
      default: '#ffffff'
    }
  },
  data () {
    return {
      active: false,
      currentImg: null,
      loading: true,
      loaded: false,
      theBrowser: null,
      intersectionOptions: {
        root: null,
        rootMargin: '500px 0px 0px 0px',
        threshold: [ 0.01 ]
      }
    }
  },
  mounted () {
    this.loaded = true
    const browser = navigator.userAgent
    if (browser.includes('Safari') && !browser.includes('Chrome')) {
      this.theBrowser = 'safari'
    }
  },
  methods: {
    onWaypoint ({ going, direction }) {
      if (going === 'in' && !this.active) {
        const downloadingImage = new Image()
        if (this.theBrowser === 'safari') {
          this.currentImg = this.src
        } else {
          this.currentImg = this.webp || this.src
        }
        downloadingImage.onload = () => {
          this.loading = false
        }
        downloadingImage.src = this.currentImg
        this.active = true
      }
    }
  }
}
</script>

<style lang="sass" src="./base-background.sass"></style>

<template lang="pug" src="./index.pug" ></template>

<script>
export default {
  props: {
    props: {
      type: Object,
      default: () => ({})
    }
  },
  data: () => ({
    currIndex: null,
    currHover: null
  }),
  methods: {
    openBio (i) {
      this.currIndex === i ? this.currIndex = null : this.currIndex = i
    },
    closeBio () {
      this.currIndex = null
    },
    handleHover (i) {
      this.currHover = i
    },
    removeHover () {
      this.currHover = null
      this.currIndex = null
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

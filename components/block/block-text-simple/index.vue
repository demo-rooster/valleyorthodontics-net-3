<template lang="pug" src="./index.pug" ></template>

<script>
import { titleAnimation, fadeUpIn } from '~/resources/mixins'

export default {
  mixins: [titleAnimation, fadeUpIn],
  props: {
    props: {
      type: Object,
      default: () => ({})
    }
  },
  mounted () {
    this.$_titleAnimation(this.$refs.tsTitle)
    this.$refs.tsParagraphs.forEach((item, i) => {
      this.$_fadeUpIn(item, 40, 'top+=64 bottom')
    })
    // this.$nextTick(() => {
    // })
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

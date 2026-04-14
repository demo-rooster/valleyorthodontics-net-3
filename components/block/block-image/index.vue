<template lang="pug" src="./index.pug" ></template>

<script>
import { fadeUpIn } from '~/resources/mixins'

export default {
  mixins: [fadeUpIn],
  props: {
    props: {
      type: Object,
      default: () => ({})
    }
  },
  mounted () {
    if (this.props.title) {
      this.$_fadeUpIn(this.$refs.title, 48, 'top+=24')
    }
    if (this.props.image.src) {
      this.$_fadeUpIn(this.$refs.image, 48, 'top+=24')
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

<template lang="pug" src="./index.pug"></template>

<script>
import BaseIcon from '~/components/base/base-icon/base-icon'

export default {
  components: {
    BaseIcon
  },
  props: {
    pageCount: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

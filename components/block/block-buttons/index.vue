<template lang="pug" src="./index.pug" ></template>

<script>
import { fadeUpIn } from '~/resources/mixins'

export default {
  mixins: [fadeUpIn],
  props: {
    props: {
      type: Array,
      default: () => ([])
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

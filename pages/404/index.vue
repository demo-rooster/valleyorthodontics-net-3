<template lang="pug" src="./index.pug"></template>

<script>

export default {
  props: {
    props: {
      type: Object,
      default: () => ({})
    }
  },
  mounted () {
    this.$nextTick(() => {
      setTimeout(() => {
        this.$store.dispatch('VIEW_SITE', true)
      }, 100)
    })
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

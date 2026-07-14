<template lang="pug" src="./index.pug" ></template>

<script>
export default {
  props: {
    props: {
      type: Object,
      default: () => ({})
    },
    variant: {
      type: String,
      default: 'accent'
    }
  },
  computed: {
    buttonStyles () {
      return {
        '--btn-bg': `var(--${this.variant || 'accent'})`
      }
    }
  },
  methods: {
    onClick () {
      this.$emit('onClick')
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

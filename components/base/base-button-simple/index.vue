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
      default: 'text'
    },
    noArrow: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    buttonStyles () {
      return { '--simpleBtnClr': `var(--${this.variant || 'text'})` }
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

<template lang='pug' src='./base-icon.pug'></template>

<script>
export default {
  props: {
    name: {
      type: String,
      default: () => ``
    }
  },
  computed: {
    svg () {
      try {
        return require(`@/assets/icons/${this.name}.svg`)
      } catch (error) {
        try {
          return require(`@/assets/dental-icons/${this.name}.svg`)
        } catch (error2) {
          console.warn(`Icon "${this.name}" not found in assets/icons/ or assets/dental-icons/`)
          return null
        }
      }
    }
  }
}
</script>

<style lang="sass" src="./base-icon.sass"></style>

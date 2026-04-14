<template lang='pug' src="./index.pug"></template>

<script>
export default {
  data: () => ({
    storeHeight: 0,
    showStore: false
  }),
  mounted () {
    this.$nextTick(() => {
      this.getHeight()
      this.$store.dispatch('DEV_TOOLS', true)
    })
    window.addEventListener('resize', () => {
      this.getHeight()
    })
  },
  destroyed () {
    window.removeEventListener('resize', this.getHeight)
  },
  methods: {
    toggleDevInspector () {
      this.$store.dispatch('DEV_TOOLS', !this.$store.state.devTools)
    },
    getHeight () {
      const store = this.$refs.storedata
      this.storeHeight = store ? store.clientHeight : 0
    },
    toggleStore () {
      this.showStore = !this.showStore
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

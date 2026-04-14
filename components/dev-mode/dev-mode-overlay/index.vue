<template lang='pug' src="./index.pug"></template>

<script>
import Matrix from '~/components/dev-mode/matrix'
export default {
  components: {
    Matrix
  },
  props: {
    props: {
      type: Object,
      default: () => ({})
    },
    pageSectionSlug: {
      type: String,
      default: () => ('')
    }
  },
  data: () => ({
    detailsHeight: 0,
    expandedDetails: false,
    windowWidth: 0
  }),
  mounted () {
    this.$nextTick(() => {
      this.getHeight()
    })
    this.windowWidth = window.innerWidth
    window.addEventListener('resize', () => {
      this.windowWidth = window.innerWidth
      this.getHeight()
    })
  },
  destroyed () {
    window.removeEventListener('resize', this.getHeight)
  },
  methods: {
    getHeight () {
      const details = this.$refs.details
      this.detailsHeight = details ? details.clientHeight : 0
    },
    toggleDetails () {
      this.expandedDetails = !this.expandedDetails
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

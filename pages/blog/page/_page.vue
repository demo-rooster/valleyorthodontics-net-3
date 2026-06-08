<template lang="pug" src="./_page.pug"></template>

<script>
import { setJSONData, setMeta } from '~/resources/utils'
import PageSections from '~/components/page-sections'

export default {
  transition: 'fade',
  components: {
    PageSections
  },
  // eslint-disable-next-line require-await
  async asyncData () {
    const data = setJSONData('blog')
    return { props: { ...data, slug: 'blog' } }
  },
  mounted () {
    this.$nextTick(() => {
      if (!this.$store.state.siteLoaded) {
        this.$store.dispatch('VIEW_SITE', true)
      }
    })
  },
  head () {
    return setMeta(this.props)
  }
}
</script>

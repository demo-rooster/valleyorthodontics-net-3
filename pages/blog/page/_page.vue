<template lang="pug" src="./_page.pug"></template>

<script>
import PageSections from '~/components/page-sections'
import contentMetaPreview from '~/resources/content-meta-preview'
import { setJSONData } from '~/resources/utils'

export default {
  transition: 'fade',
  components: {
    PageSections
  },
  mixins: [contentMetaPreview],
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
  }
}
</script>

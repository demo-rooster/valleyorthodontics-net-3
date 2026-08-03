<template lang="pug" src="./index.pug"></template>

<script>
import DevModeComponentLocations from '~/components/dev-mode/dev-mode-component-locations'
import PageSections from '~/components/page-sections'
import StyleGuide from '~/components/style-guide-component'
import contentMetaPreview from '~/resources/content-meta-preview'
import { getAllPages, setData } from '~/resources/utils'

export default {
  components: {
    DevModeComponentLocations,
    PageSections,
    StyleGuide
  },
  mixins: [contentMetaPreview],
  async asyncData () {
    const props = await setData('style-guide')
    const allPages = await getAllPages()
    return { props, allPages }
  }
}
</script>

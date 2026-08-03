<template lang='pug' src='./index.pug'></template>

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
  data () {
    return {
      props: {}
    }
  },
  // eslint-disable-next-line require-await
  async asyncData () {
    const props = setJSONData('about')
    return { props }
  }
}
</script>

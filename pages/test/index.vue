<template lang='pug' src='./index.pug'></template>

<script>
import PageSections from '~/components/page-sections'
import contentMetaPreview from '~/resources/content-meta-preview'
import { setData } from '~/resources/utils'

export default {
  transition: 'fade',
  components: {
    PageSections
  },
  mixins: [contentMetaPreview],
  async asyncData () {
    const props = await setData('test')
    return { props }
  }
}
</script>

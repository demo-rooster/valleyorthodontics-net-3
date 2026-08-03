<template lang='pug' src='./_slug.pug'></template>

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
  async asyncData ({ params, error }) {
    const props = setJSONData(params.slug)
    if (!props.sections || !props.sections.length) {
      error({ statusCode: 404, message: 'Page not found' })
      return {}
    }
    return {
      props: {
        ...props,
        slug: params.slug
      }
    }
  }
}
</script>

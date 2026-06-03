<template lang='pug' src='./_slug.pug'></template>

<script>
import PageSections from '~/components/page-sections'
import { setJSONData, setMeta } from '~/resources/utils'

export default {
  transition: 'fade',
  components: {
    PageSections
  },
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
  },
  head () {
    return setMeta(this.props)
  }
}
</script>

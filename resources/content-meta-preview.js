import { getPageKeyForPath } from '~/resources/content-builder'
import { setMeta } from '~/resources/utils'

export const resolveContentPreviewMeta = ({
  props,
  routePath,
  customizationEnabled,
  activePageKey,
  contentPages
}) => {
  const pageKey = getPageKeyForPath(routePath)
  const page = pageKey && contentPages[pageKey]

  if (!customizationEnabled || activePageKey !== pageKey || !page) {
    return props
  }

  return {
    ...props,
    seo: page.seo
  }
}

export default {
  computed: {
    contentPreviewMeta () {
      return resolveContentPreviewMeta({
        props: this.props,
        routePath: this.$route.path,
        customizationEnabled: this.$store.state.customizationEnabled,
        activePageKey: this.$store.state.activeContentPageKey,
        contentPages: this.$store.state.contentPages
      })
    }
  },
  head () {
    return setMeta(this.contentPreviewMeta)
  }
}

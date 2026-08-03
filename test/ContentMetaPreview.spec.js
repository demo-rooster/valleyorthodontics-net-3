import { resolveContentPreviewMeta } from '~/resources/content-meta-preview'

describe('content meta preview', () => {
  const props = {
    title: 'home',
    slug: '',
    meta: {
      seo: {
        page_title: 'Published title',
        page_description: 'Published description'
      }
    }
  }
  const page = {
    seo: {
      page_title: 'Draft title',
      page_description: 'Draft description'
    }
  }

  test('overlays the active working page SEO during customization', () => {
    const result = resolveContentPreviewMeta({
      props,
      routePath: '/',
      customizationEnabled: true,
      activePageKey: 'Home',
      contentPages: { Home: page }
    })

    expect(result).toEqual({ ...props, seo: page.seo })
    expect(result.meta).toBe(props.meta)
  })

  test.each([
    ['customization is disabled', false, 'Home'],
    ['another page is active', true, 'About']
  ])('uses published props when %s', (label, customizationEnabled, activePageKey) => {
    const result = resolveContentPreviewMeta({
      props,
      routePath: '/',
      customizationEnabled,
      activePageKey,
      contentPages: { Home: page }
    })

    expect(result).toBe(props)
  })
})

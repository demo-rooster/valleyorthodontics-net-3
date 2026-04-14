import { url } from '../resources/api'

export const siteHead = (meta, theme = {}) => {
  const faviconUrl = theme?.default?.favicon_url || '/favicon.ico'
  return {
    htmlAttrs: { lang: 'en' },
    title: meta.seo.page_title ? meta.seo.page_title : meta.title,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'referrer', content: 'no-referrer' },
      { hid: 'robots', name: 'robots', content: 'noindex, nofollow' },
      { hid: 'description', name: 'description', content: meta.seo.page_description },
      { hid: 'keywords', name: 'keywords', content: meta.seo.page_keywords ? meta.seo.page_keywords : '' },
      // OG Meta
      { hid: 'og:type', property: 'og:type', content: 'website' },
      meta.seo.social_meta.og_meta.title && { hid: 'og:title', property: 'og:title', content: meta.seo.social_meta.og_meta.title },
      meta.seo.social_meta.og_meta.description && { hid: 'og:description', property: 'og:description', content: meta.seo.social_meta.og_meta.description },
      meta.seo.social_meta.og_meta.image && { hid: 'og:image', property: 'og:image', content: meta.seo.social_meta.og_meta.image },
      { hid: 'og:url', property: 'og:url', content: url }
    ],
    link: [
      { rel: 'icon', href: faviconUrl },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
      { hid: 'canonical', rel: 'canonical', href: url }
    ],
    script: [
      {
        hid: 'gtag',
        src: 'https://www.googletagmanager.com/gtag/js?id=G-EP9BQ2J5P8',
        async: true
      },
      {
        hid: 'gtag-config',
        type: 'text/javascript',
        innerHTML: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-EP9BQ2J5P8');
        `
      }
    ],
    __dangerouslyDisableSanitizersByTagID: {
      'gtag-config': ['innerHTML']
    }
  }
}

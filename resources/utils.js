import axios from 'axios'
import { api, url } from './api'

export const getAllPages = async () => {
  try {
    const getPath = (str) => {
      const regex = /.*\.com/ // eslint-disable-line
      const match = str.match(regex)
      if (match) {
        return str.replace(match[0], '')
      } else {
        return str
      }
    }

    const response = await axios.get(
      `${api}/wp/v2/pages?per_page=100`
    )

    const dataPages = response.headers['x-wp-totalpages']
    let dataArray = response.data
    for (let i = 2; i <= dataPages; i++) {
      const nextPage = await axios.get(
        `${api}/wp/v2/pages?per_page=100&page=${i}`
      )
      dataArray = [...dataArray, ...nextPage.data]
    }

    return dataArray.map(item => ({
      parent: item.parent,
      path: getPath(item.link),
      slug: item.slug,
      title: item.title.rendered,
      ...item.acf
    }))
  } catch (e) {
    console.error(`ERROR getting pages for dev-mode-component-locations: ${e}`)
  }
}

// gets data for all forms
export const getForms = async () => {
  try {
    const response = await axios.get(
      `${api}/wp/v2/forms?per_page=100`
    )
    const dataPages = response.headers['x-wp-totalpages']
    let dataArray = response.data
    for (let i = 2; i <= dataPages; i++) {
      const nextPage = await axios.get(
        `${api}/wp/v2/forms?per_page=100&page=${i}`
      )
      dataArray = [...dataArray, ...nextPage.data]
    }
    return dataArray.map(item => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      ...item.acf
    }))
  } catch (e) {
    console.error(`ERROR getting FORMS posts: ${e}`)
  }
}

// gets data for all custom posts of a specific type
export const getCustomPosts = async (customPostType, total = 100) => {
  try {
    const response = await axios.get(
      `${api}/wp/v2/${customPostType}?per_page=${total}`
    )
    const dataPages = response.headers['x-wp-totalpages']
    let dataArray = response.data.map(item => ({
      id: item.id,
      title: item.title,
      path: `/${customPostType === 'posts' ? 'blog' : customPostType}/${item.slug}`,
      slug: item.slug,
      category: item.categories ? item.categories[0] : null,
      post: item.acf
    }))
    const currentPosts = { '1': dataArray }
    for (let i = 2; i <= dataPages; i++) {
      const nextPage = await axios.get(
        `${api}/wp/v2/${customPostType}?per_page=${total}&page=${i}`
      )
      const next = nextPage.data.map(item => ({
        id: item.id,
        title: item.title.rendered,
        path: `/${customPostType === 'posts' ? 'blog' : customPostType}/${item.slug}`,
        slug: item.slug,
        category: item.categories ? item.categories[0] : null,
        post: item.acf
      }))
      dataArray = [...dataArray, ...next]
      currentPosts[`${i}`] = next
    }
    const sortedDataArr = dataArray.sort((a, b) => {
      const aDate = new Date(a.date)
      const bDate = new Date(b.date)
      return bDate - aDate
    })

    const data = {
      posts: sortedDataArr,
      postsPerPage: currentPosts,
      pageCount: dataPages
    }
    return data
  } catch (e) {
    console.error(`ERROR getting ${customPostType} posts: ${e}`)
  }
}

export const getThemeJSON = () => {
  return require('../data/theme.json')
}

export const setJSONData = (slug, customPostType = 'pages') => {
  try {
    slug = slug.toLowerCase()
    // Using require ensures data is included at build time for static generation
    const jsonData = require(`../data/${customPostType}.json`)
    if (slug === 'global') {
      return jsonData
    }

    // Get the pages data - pages.json has { pages: {...}, sitemap_metadata: {...} }
    const pagesData = jsonData.pages || jsonData

    // Get the data array for this slug - make it case insensitive
    const slugData = pagesData[slug] ||
                    Object.keys(pagesData).find(key => key.toLowerCase() === slug)
      ? pagesData[Object.keys(pagesData).find(key => key.toLowerCase() === slug)]
      : undefined
    let seoData = {}
    let pageSections = []

    // If slugData is an array, process it
    if (Array.isArray(slugData)) {
      // Extract SEO object from the array if it exists
      pageSections = slugData.filter(item => !item.seo)
      const seoItem = slugData.find(item => item.seo)
      if (seoItem) {
        seoData = seoItem
      }
    } else {
      // If not an array, use as is
      pageSections = slugData
    }

    const item = {
      title: slug,
      sections: pageSections,
      meta: seoData
    }
    console.log('item', item)
    if (!item) {
      console.error(`No item found with slug: ${slug} in ${customPostType}.json`)
      return {} // Return empty object instead of throwing to avoid build failures
    }

    return item
  } catch (error) {
    console.error(`Error loading data for ${slug}:`, error.message)
    return {} // Return empty object instead of throwing to avoid build failures
  }
}

export const setData = async (slug, customPostType = 'pages') => {
  try {
    const response = await axios.get(
      `${api}/wp/v2/${customPostType}?slug=${slug}`
    )

    const data = {
      title: response.data[0].title.rendered,
      slug: response.data[0].slug,
      ...response.data[0].acf
    }
    return { ...data }
  } catch (e) {
    console.error(`${slug} page: ${e}`)
  }
}

export const setMeta = (meta) => {
  // Get the SEO data from either meta.seo or meta.meta.seo
  const seoData = meta.seo || (meta.meta && meta.meta.seo) || {}

  return {
    title: seoData.page_title ? seoData.page_title : meta.title,
    meta: [
      seoData.page_description && { hid: 'description', name: 'description', content: seoData.page_description },
      seoData.page_keywords && { hid: 'keywords', name: 'keywords', content: seoData.page_keywords },
      // // OG Meta
      { hid: 'og:type', property: 'og:type', content: 'website' },
      seoData.page_title && { hid: 'og:title', property: 'og:title', content: seoData.social_meta?.og_meta?.title ? seoData.social_meta.og_meta.title : seoData.page_title },
      seoData.page_description && { hid: 'og:description', property: 'og:description', content: seoData.social_meta?.og_meta?.description ? seoData.social_meta.og_meta.description : seoData.page_description },
      seoData.social_meta?.og_meta?.image && { hid: 'og:image', property: 'og:image', content: seoData.social_meta.og_meta.image },
      { hid: 'og:url', property: 'og:url', content: `${url}${meta.slug || ''}` }
    ],
    link: [
      { hid: 'canonical', rel: 'canonical', href: `${url}${meta.slug || ''}` }
    ]
  }
}

import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { api, url } from '../resources/api'

// Build blog routes from the local data/posts.json mirror. Used as a fallback
// when the live WordPress API is unavailable or returns unexpected data, so the
// sitemap route generator always resolves to an array (never undefined).
const getLocalBlogRoutes = () => {
  try {
    const postsFile = path.join(process.cwd(), 'data', 'posts.json')
    const postsData = JSON.parse(fs.readFileSync(postsFile, 'utf8'))
    const posts = Array.isArray(postsData.posts) ? postsData.posts : []
    const routes = new Set(['/blog/page/1'])

    Object.keys(postsData.postsPerPage || {}).forEach((page) => {
      routes.add(`/blog/page/${page}`)
    })

    posts.forEach((post) => {
      if (post.slug) {
        routes.add(`/blog/${post.slug}`)
      }
    })

    return [...routes]
  } catch (e) {
    return ['/blog/page/1']
  }
}

export const siteMap = {
  path: '/sitemap.xml',
  hostname: url,
  gzip: true,
  lastmod: new Date(),
  sitemaps: [
    {
      path: '/sitemap-pages.xml',
      defaults: {
        changefreq: 'daily',
        priority: 0.9,
        lastmod: new Date()
      },
      routes: [
        {
          url: '/',
          priority: 1
        }
      ]
    },
    {
      path: '/blog/sitemap-blog.xml',
      defaults: {
        changefreq: 'daily',
        priority: 0.1,
        lastmod: new Date()
      },
      exclude: ['/**'],
      routes: async () => {
        try {
          // Get All Blog Posts
          const response = await axios.get(`${api}/wp/v2/posts?per_page=100`)
          if (!Array.isArray(response.data)) {
            throw new TypeError(
              'WordPress posts API returned a non-array response'
            )
          }
          const dataPages = response.headers['x-wp-totalpages']
          const routes = []
          let blogArray = response.data
          routes.push('/blog/page/1')
          for (let i = 2; i <= dataPages; i++) {
            const nextPage = await axios.get(
              `${api}/wp/v2/posts?per_page=100&page=${i}`
            )
            if (Array.isArray(nextPage.data)) {
              blogArray = [...blogArray, ...nextPage.data]
            }
            routes.push('/blog/page/' + i)
          }
          blogArray.forEach((post) => {
            routes.push('/blog/' + post.slug)
          })
          return routes
        } catch (e) {
          // Never return undefined: the sitemap module maps over this result,
          // so fall back to the local blog routes to keep the build alive.
          console.warn(
            `SITEMAP BLOG API: falling back to local blog routes; WordPress posts API unavailable: ${e}`
          )
          return getLocalBlogRoutes()
        }
      }
    }
  ]
}

export const setRobots = {
  UserAgent: '*',
  Disallow: '/',
  Sitemap: url + 'sitemap.xml'
}

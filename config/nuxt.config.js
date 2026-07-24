import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { api } from '../resources/api'
import { siteHead } from './head.config.js'
import buildConfig from './build.config.js'
import { siteMap, setRobots } from './seo.config'
import 'core-js/features/array/at'

// Load theme.json using absolute path from project root
const themeFile = path.join(process.cwd(), 'data', 'theme.json')
const theme = JSON.parse(fs.readFileSync(themeFile, 'utf8'))
const staticPageKeys = new Set(['Home', 'About', 'Get Started', 'Treatments', 'Contact', 'FAQ'])

const getLocalDynamicRoutes = () => {
  const pagesFile = path.join(process.cwd(), 'data', 'pages.json')
  const pages = JSON.parse(fs.readFileSync(pagesFile, 'utf8'))

  return Object.keys(pages)
    .filter(key => !staticPageKeys.has(key))
    .filter(key => /^[a-z0-9-]+$/.test(key))
    .map(key => `/${key}`)
}

const getLocalBlogRoutes = () => {
  const postsFile = path.join(process.cwd(), 'data', 'posts.json')
  const postsData = JSON.parse(fs.readFileSync(postsFile, 'utf8'))
  const posts = postsData.posts || []
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
}

const getHomeMeta = () => {
  const pagesFile = path.join(process.cwd(), 'data', 'pages.json')
  const pages = JSON.parse(fs.readFileSync(pagesFile, 'utf8'))
  const seo = pages.Home.find(section => section.seo).seo

  return {
    title: 'home',
    seo
  }
}

// Extract Google Fonts from theme.json typography
const systemFonts = ['helvetica', 'arial', 'sans-serif', 'serif', 'monospace', 'georgia']
const typography = (theme.default && theme.default.typography) || []
const googleFonts = typography
  .flatMap(entry => (entry.font.match(/'([^']+)'/g) || []))
  .map(font => font.replace(/'/g, ''))
  .filter(font => !systemFonts.includes(font.toLowerCase()))
  .map(font => `${font.replace(/\s+/g, '+')}:400,600,700`)

// Add display=swap to last font for better loading performance
if (googleFonts.length > 0) {
  googleFonts[googleFonts.length - 1] += '&display=swap'
}

export default () => {
  const meta = getHomeMeta()
  return {
    server: {
      port: 8081,
      host: '0.0.0.0'
    },
    target: 'static',
    generate: {
      async routes () {
        const dyRoutes = getLocalDynamicRoutes()
        const addRoute = route => !dyRoutes.includes(route) && dyRoutes.push(route)

        getLocalBlogRoutes().forEach(addRoute)

        try {
          await axios.get(`${api}/wp/v2/posts?per_page=100`).then(async (response) => {
            const dataPages = response.headers['x-wp-totalpages']
            let postsArray = response.data
            addRoute('/blog/page/1')
            for (let i = 2; i <= dataPages; i++) {
              const nextPage = await axios.get(
                `${api}/wp/v2/posts?per_page=100&page=${i}`
              )
              postsArray = [...postsArray, ...nextPage.data]
              addRoute('/blog/page/' + i)
            }
            return postsArray.map((post) => {
              addRoute('/blog/' + post.slug)
            })
          })
        } catch (e) {
          console.warn(`Falling back to local blog routes; WordPress posts API unavailable: ${e}`)
        }

        return dyRoutes
      }
    },
    head: siteHead(meta, theme),
    globalName: 'globalContent',
    loading: { color: '#fff' },
    components: {
      dirs: [
        '~/components',
        '~/components/custom',
        '~/components/block'
      ]
    },
    polyfill: {
      features: [
        {
          require: 'intersection-observer',
          detect: () => 'IntersectionObserver' in window
        }
      ]
    },
    plugins: [
      '~/resources/components',
      '~/resources/mixins',
      {
        src: '~/resources/content-builder-fields.client.js',
        mode: 'client'
      },
      '~/resources/vendors.js',
      {
        src: '~/resources/vendors.client.js',
        mode: 'client'
      },
      {
        src: '~/resources/userway.js',
        mode: 'client'
      }
    ],
    modules: [
      '@nuxtjs/axios',
      '@nuxtjs/style-resources',
      ...(googleFonts.length > 0 ? ['nuxt-webfontloader'] : []),
      '@nuxtjs/robots',
      '@nuxtjs/sitemap',
      'nuxt-polyfill',
      '@nuxtjs/gtm'
    ],
    // gtm: {
    //   id: 'GTM-MQ6QNRZ'
    // },
    robots: setRobots,
    sitemap: siteMap,
    css: [
      { src: '~/styles/static/normalize.sass', lang: 'sass' },
      { src: '~/styles/index.sass', lang: 'sass' }
    ],
    styleResources: {
      sass: [
        '~/styles/base/*.sass',
        '~/styles/utilities/*.sass',
        '~/styles/grid/*.sass'
      ]
    },
    stylelint: {
      files: [
        'styles/*.sass',
        'styles/**/*.sass',
        'components/**/*.sass',
        'components/**/**/*.sass'
      ]
    },
    ...(googleFonts.length > 0 && {
      webfontloader: {
        google: {
          families: googleFonts
        }
      }
    }),
    buildModules: [
      '@nuxtjs/eslint-module',
      '@nuxtjs/stylelint-module',
      'nuxt-gsap-module'
    ],
    gsap: {
      extraPlugins: {
        scrollTrigger: true
      },
      clubPlugins: {
        customEase: true,
        splitText: true
      },
      extraEases: {
        customEase: true
      }
    },
    vue: {
      config: {
        productionTip: false
      }
    },
    build: buildConfig
  }
}

const fs = require('fs')
const path = require('path')
const https = require('https')

// WordPress API base URL
const API_BASE = 'https://api-stinson.roostergrintemplates.com/wp-json'

// Helper to make HTTPS GET requests
const fetchJSON = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}`))
        }
      })
    }).on('error', reject)
  })
}

// Extract slug from URL
const getSlugFromUrl = (url) => {
  if (!url) { return '/' }
  const parsed = new URL(url)
  const pathname = parsed.pathname
  // Remove trailing slash for processing, but keep for root
  if (pathname === '/') { return '/' }
  return pathname.endsWith('/') ? pathname : pathname + '/'
}

// Get directory name from slug (last segment)
const getDirectoryName = (slug) => {
  if (slug === '/') { return 'index' }
  const segments = slug.replace(/^\/|\/$/g, '').split('/')
  return segments[segments.length - 1]
}

// Try to fetch WordPress menu
const fetchMenu = async (menuSlug = 'primary') => {
  try {
    // Try WP REST API Menus plugin format
    const menuUrl = `${API_BASE}/menus/v1/menus/${menuSlug}`
    console.log(`📡 Trying to fetch menu: ${menuUrl}`)
    const menu = await fetchJSON(menuUrl)
    if (menu && menu.items && menu.items.length > 0) {
      return menu.items
    }
  } catch (e) {
    console.log(`   Menu "${menuSlug}" not found, trying alternatives...`)
  }

  // Try common menu slugs
  const menuSlugs = ['main-menu', 'main', 'header', 'navigation', 'primary-menu']
  for (const slug of menuSlugs) {
    try {
      const menuUrl = `${API_BASE}/menus/v1/menus/${slug}`
      const menu = await fetchJSON(menuUrl)
      if (menu && menu.items && menu.items.length > 0) {
        console.log(`   Found menu: ${slug}`)
        return menu.items
      }
    } catch (e) {
      // Continue to next slug
    }
  }

  // Try to list all menus
  try {
    const menusUrl = `${API_BASE}/menus/v1/menus`
    const menus = await fetchJSON(menusUrl)
    if (Array.isArray(menus) && menus.length > 0) {
      console.log(`   Available menus: ${menus.map(m => m.slug || m.name).join(', ')}`)
      // Try first menu
      const firstMenu = menus[0]
      const menuUrl = `${API_BASE}/menus/v1/menus/${firstMenu.slug || firstMenu.term_id}`
      const menu = await fetchJSON(menuUrl)
      if (menu && menu.items && menu.items.length > 0) {
        return menu.items
      }
    }
  } catch (e) {
    // No menus endpoint available
  }

  return null
}

// Fetch all pages from WordPress
const fetchPages = async () => {
  const pagesUrl = `${API_BASE}/wp/v2/pages?per_page=100&status=publish`
  console.log(`📡 Fetching pages: ${pagesUrl}`)
  try {
    const pages = await fetchJSON(pagesUrl)
    return pages
  } catch (e) {
    console.error('❌ Failed to fetch pages:', e.message)
    return []
  }
}

// Build router from menu items (with hierarchy)
const buildRouterFromMenu = (menuItems) => {
  const router = []

  const processItem = (item) => {
    const slug = getSlugFromUrl(item.url)
    const route = {
      name: item.title || item.post_title || 'Untitled',
      path: slug,
      navigation: slug !== '/'
    }

    if (slug === '/') {
      route.mobile = true
    }

    // Process children if present
    if (item.children && item.children.length > 0) {
      route.children = item.children.map((child) => {
        const childSlug = getSlugFromUrl(child.url)
        return {
          name: child.title || child.post_title || 'Untitled',
          path: '/' + getDirectoryName(childSlug)
        }
      })
    }

    return route
  }

  // Process top-level items
  menuItems.forEach((item) => {
    // Skip items that are children (have parent > 0)
    if (!item.menu_item_parent || item.menu_item_parent === '0' || item.menu_item_parent === 0) {
      router.push(processItem(item))
    }
  })

  return router
}

// Build router from pages (flat structure)
const buildRouterFromPages = (pages) => {
  const router = []

  // Sort by menu_order or title
  pages.sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0))

  pages.forEach((page) => {
    const slug = '/' + page.slug + '/'
    const isHome = page.slug === 'home' || page.slug === ''

    const route = {
      name: page.title.rendered || page.slug,
      path: isHome ? '/' : slug,
      navigation: !isHome
    }

    if (isHome) {
      route.mobile = true
    }

    router.push(route)
  })

  // Ensure home is first
  const homeIndex = router.findIndex(r => r.path === '/')
  if (homeIndex > 0) {
    const [home] = router.splice(homeIndex, 1)
    router.unshift(home)
  } else if (homeIndex === -1) {
    // Add home if not present
    router.unshift({
      name: 'Home',
      path: '/',
      navigation: false,
      mobile: true
    })
  }

  return router
}

// Format router content for file output
const formatRouterContent = (router) => {
  const formatRoute = (route, indent = 2) => {
    const spaces = ' '.repeat(indent)
    let result = `${spaces}{\n`

    result += `${spaces}  name: '${route.name.replace(/'/g, "\\'")}',\n`
    result += `${spaces}  path: '${route.path}',\n`
    result += `${spaces}  navigation: ${route.navigation}`

    if (route.mobile !== undefined) {
      result += `,\n${spaces}  mobile: ${route.mobile}`
    }

    if (route.children && route.children.length > 0) {
      result += `,\n${spaces}  children: [\n`
      route.children.forEach((child, i) => {
        result += `${spaces}    {\n`
        result += `${spaces}      name: '${child.name.replace(/'/g, "\\'")}',\n`
        result += `${spaces}      path: '${child.path}'\n`
        result += `${spaces}    }${i < route.children.length - 1 ? ',' : ''}\n`
      })
      result += `${spaces}  ]`
    }

    result += `\n${spaces}}`
    return result
  }

  let content = 'const router = [\n'
  router.forEach((route, i) => {
    content += formatRoute(route)
    content += i < router.length - 1 ? ',\n' : '\n'
  })
  content += ']\n\nexport default router\n'

  return content
}

// Generate page files
const generatePageFiles = (pageKey, dirName) => {
  const vueFile = `<template lang='pug' src='./index.pug'></template>

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
  async asyncData () {
    const props = setJSONData('${pageKey}')
    return { props }
  },
  head () {
    return setMeta(this.props)
  }
}
</script>
`

  const pugFile = `.pages-${dirName}
  PageSections(:pageTitle='props.title', :props='props.sections')
`

  const sassFile = `.pages-${dirName}
  // Page-specific styles
`

  return { vueFile, pugFile, sassFile }
}

// Sync pages directory based on router
const syncPagesDirectory = (router, pagesDir) => {
  // Build page map from router
  const pageMap = new Map()

  const processRoutes = (routes) => {
    routes.forEach((route) => {
      const dirName = getDirectoryName(route.path)
      pageMap.set(dirName, route.name)
      if (route.children) {
        route.children.forEach((child) => {
          const childDirName = getDirectoryName(child.path)
          pageMap.set(childDirName, child.name)
        })
      }
    })
  }

  processRoutes(router)
  pageMap.set('404', '404') // Preserve 404

  // Get existing directories
  const existingDirs = fs.readdirSync(pagesDir).filter((item) => {
    return fs.statSync(path.join(pagesDir, item)).isDirectory()
  })

  let deletedCount = 0
  let createdCount = 0
  let skippedCount = 0

  // Delete pages not in router
  console.log('\n🗑️  Checking for pages to delete...')
  existingDirs.forEach((dir) => {
    if (!pageMap.has(dir)) {
      fs.rmSync(path.join(pagesDir, dir), { recursive: true })
      console.log(`   Deleted: ${dir}`)
      deletedCount++
    }
  })
  if (deletedCount === 0) { console.log('   No pages to delete') }

  // Create missing pages
  console.log('\n📁 Creating missing pages...')
  pageMap.forEach((pageKey, dirName) => {
    if (dirName === 'index' || dirName === '404') {
      skippedCount++
      return
    }

    const pageDir = path.join(pagesDir, dirName)
    if (fs.existsSync(pageDir)) {
      skippedCount++
      return
    }

    fs.mkdirSync(pageDir, { recursive: true })
    const { vueFile, pugFile, sassFile } = generatePageFiles(pageKey, dirName)
    fs.writeFileSync(path.join(pageDir, 'index.vue'), vueFile)
    fs.writeFileSync(path.join(pageDir, 'index.pug'), pugFile)
    fs.writeFileSync(path.join(pageDir, 'index.sass'), sassFile)
    console.log(`   Created: ${dirName}`)
    createdCount++
  })

  return { deletedCount, createdCount, skippedCount }
}

// Main execution
const main = async () => {
  console.log('🚀 Generating routes from WordPress API...\n')

  const projectRoot = path.join(__dirname, '..')
  const pagesDir = path.join(projectRoot, 'pages')
  const routerFile = path.join(projectRoot, 'router/index.js')

  let router = []
  let source = 'unknown'

  // Try to get menu first
  const menuItems = await fetchMenu()

  if (menuItems && menuItems.length > 0) {
    console.log(`✅ Found menu with ${menuItems.length} items\n`)
    router = buildRouterFromMenu(menuItems)
    source = 'menu'
  } else {
    console.log('⚠️  No menu found, falling back to pages...\n')
    const pages = await fetchPages()
    if (pages.length > 0) {
      console.log(`✅ Found ${pages.length} pages\n`)
      router = buildRouterFromPages(pages)
      source = 'pages'
    } else {
      console.error('❌ No pages found!')
      process.exit(1)
    }
  }

  // Write router file
  console.log('📄 Writing router/index.js...')
  const routerContent = formatRouterContent(router)
  fs.writeFileSync(routerFile, routerContent)
  console.log(`   Generated ${router.length} routes from ${source}`)

  // Sync pages directory
  const { deletedCount, createdCount, skippedCount } = syncPagesDirectory(router, pagesDir)

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('✨ Route generation complete!\n')
  console.log('📊 Summary:')
  console.log(`   - Source: WordPress ${source}`)
  console.log(`   - Routes generated: ${router.length}`)
  console.log(`   - Pages created: ${createdCount}`)
  console.log(`   - Pages skipped: ${skippedCount}`)
  console.log(`   - Pages deleted: ${deletedCount}`)
  console.log('='.repeat(60) + '\n')

  console.log('📋 Next steps:')
  console.log('   1. Review router/index.js')
  console.log('   2. Add page content to data/pages.json')
  console.log('   3. Run: npm run dev\n')
}

main().catch((err) => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})

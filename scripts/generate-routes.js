const fs = require('fs')
const path = require('path')

// Load pages.json with sitemap_metadata
const loadPagesData = () => {
  const pagesJsonPath = path.join(__dirname, '../data/pages.json')
  if (!fs.existsSync(pagesJsonPath)) {
    console.error('❌ Error: data/pages.json not found!')
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(pagesJsonPath, 'utf8'))
}

// Derive slug from page name (e.g., "Home" -> "/", "Get Started" -> "/get-started/")
const deriveSlugFromName = (pageName) => {
  if (pageName === 'Home') {
    return '/'
  }
  const slug = pageName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
  return `/${slug}/`
}

// Get slug from meta, or derive from page name if not present
const getSlug = (pageName, meta) => {
  if (pageName === 'Home') {
    return '/'
  }
  if (meta.slug) {
    // Ensure leading slash for non-home pages
    return meta.slug.startsWith('/') ? meta.slug : `/${meta.slug}`
  }
  return deriveSlugFromName(pageName)
}

// Extract flat slug (last segment) from a path
const getFlatSlug = (slug) => {
  if (!slug || slug === '/') {
    return '/'
  }
  const segments = slug.split('/').filter(Boolean)
  return '/' + segments[segments.length - 1]
}

// Generate page file templates
const generatePageFiles = (pageKey, slug) => {
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

  const pugFile = `.pages-${slug}
  PageSections(:pageTitle='props.title', :props='props.sections')
`

  const sassFile = `.pages-${slug}
  // Page-specific styles
`

  return { vueFile, pugFile, sassFile }
}

// Format a route object with proper single quotes
const formatRoute = (route, indent = 2) => {
  const spaces = ' '.repeat(indent)
  const properties = []

  // Collect properties
  if (route.name !== undefined) {
    properties.push(`name: '${route.name.replace(/'/g, "\\'")}'`)
  }
  if (route.path !== undefined) {
    properties.push(`path: '${route.path}'`)
  }
  if (route.navigation !== undefined) {
    properties.push(`navigation: ${route.navigation}`)
  }
  if (route.mobile !== undefined) {
    properties.push(`mobile: ${route.mobile}`)
  }

  // Add children if present
  if (route.children && route.children.length > 0) {
    let childrenStr = 'children: [\n'
    route.children.forEach((child, index) => {
      childrenStr += `${spaces}    {\n`
      childrenStr += `${spaces}      name: '${child.name.replace(/'/g, "\\'")}',\n`
      childrenStr += `${spaces}      path: '${child.path}'\n`
      childrenStr += `${spaces}    }${index < route.children.length - 1 ? ',' : ''}\n`
    })
    childrenStr += `${spaces}  ]`
    properties.push(childrenStr)
  }

  // Build result with proper indentation and commas
  let result = `${spaces}{\n`
  properties.forEach((prop, index) => {
    const comma = index < properties.length - 1 ? ',' : ''
    if (prop.includes('\n')) {
      // Multi-line property (children)
      result += `${spaces}  ${prop}${comma}\n`
    } else {
      result += `${spaces}  ${prop}${comma}\n`
    }
  })
  result += `${spaces}}`

  return result
}

// Generate router file content
const generateRouterContent = (routes) => {
  let content = 'const router = [\n'

  routes.forEach((route, index) => {
    content += formatRoute(route, 2)
    if (index < routes.length - 1) {
      content += ',\n'
    } else {
      content += '\n'
    }
  })

  content += ']\n\nexport default router\n'
  return content
}

// Main execution
const main = () => {
  console.log('🚀 Starting automatic route generation from sitemap_metadata...\n')

  const projectRoot = path.join(__dirname, '..')
  const pagesDir = path.join(projectRoot, 'pages')
  const routerFile = path.join(projectRoot, 'router/index.js')

  // Load pages.json
  const { pages, sitemap_metadata: sitemapMetadata } = loadPagesData()

  if (!sitemapMetadata) {
    console.error('❌ Error: sitemap_metadata not found in pages.json!')
    process.exit(1)
  }

  console.log(`📚 Loaded ${Object.keys(pages).length} pages`)
  console.log(`📍 Loaded ${Object.keys(sitemapMetadata).length} sitemap entries\n`)

  // Group pages by hierarchy, preserving original order from sitemap_metadata
  const topLevelPagesMap = {} // keyed by slug
  const childPagesByParent = {}

  Object.entries(sitemapMetadata).forEach(([pageName, meta], originalIndex) => {
    const slug = getSlug(pageName, meta)
    if (meta.depth === 0) {
      // Explicit top-level page - keep earlier order if already inferred from child
      const existingOrder = topLevelPagesMap[slug]?._order
      const order = existingOrder !== undefined ? Math.min(existingOrder, originalIndex) : originalIndex
      topLevelPagesMap[slug] = { name: pageName, ...meta, slug, _order: order }
    } else if (meta.depth === 1 && meta.parent_slug) {
      // Child page - also ensure parent exists (infer from parent_slug if needed)
      if (!childPagesByParent[meta.parent_slug]) {
        childPagesByParent[meta.parent_slug] = []
      }
      childPagesByParent[meta.parent_slug].push({ name: pageName, ...meta, slug, _order: originalIndex })

      // If parent doesn't exist as explicit depth 0 entry, infer it from parent_slug
      if (!topLevelPagesMap[meta.parent_slug]) {
        // Extract name from parent_slug (e.g., "/our-office/" -> "Our Office")
        const parentSlugClean = meta.parent_slug.replace(/^\/|\/$/g, '')
        const inferredName = parentSlugClean
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
        topLevelPagesMap[meta.parent_slug] = {
          name: inferredName,
          slug: meta.parent_slug,
          depth: 0,
          _order: originalIndex, // Use first child's position as parent's order
          _inferred: true
        }
      }
    }
  })

  // Convert to array and sort to preserve original order from sitemap_metadata
  const topLevelPages = Object.values(topLevelPagesMap).sort((a, b) => a._order - b._order)
  Object.values(childPagesByParent).forEach((children) => {
    children.sort((a, b) => a._order - b._order)
  })

  console.log('🗂️  Navigation structure:')
  console.log(`   - Top-level pages: ${topLevelPages.length}`)
  console.log(`   - Parent pages with children: ${Object.keys(childPagesByParent).length}\n`)

  // Build router
  const router = topLevelPages.map((page) => {
    const route = {
      name: page.name,
      path: page.slug,
      navigation: page.slug !== '/'
    }

    if (page.slug === '/') {
      route.mobile = true
    }

    // Add children if this page has any
    const children = childPagesByParent[page.slug]
    if (children && children.length > 0) {
      route.children = children.map(child => ({
        name: child.name,
        path: getFlatSlug(child.slug)
      }))
      console.log(`   📂 ${page.name}: ${children.length} children`)
    }

    return route
  })

  // Add hash-based children from page sections for pages without depth-based children
  router.forEach((route) => {
    // Skip if already has depth-based children
    if (route.children && route.children.length > 0) {
      return
    }

    // Find the page sections in pages data
    const pageSections = pages[route.name]
    if (!pageSections || !Array.isArray(pageSections)) {
      return
    }

    const hashChildren = []
    pageSections.forEach((section) => {
      // Skip hero sections
      if (section.acf_fc_layout === 'hero') {
        return
      }
      // Skip hidden sections
      if (section.hide_component || (section.component_options && section.component_options.hide_component)) {
        return
      }
      // Skip sections without component_options or hash
      const hash = section.component_options && section.component_options.hash
      if (!hash) {
        return
      }
      // Skip form sections
      if (hash === 'form' || hash.startsWith('form')) {
        return
      }

      hashChildren.push({
        name: section.title,
        path: '#' + hash
      })
    })

    if (hashChildren.length > 0) {
      route.children = hashChildren
      console.log(`   📂 ${route.name}: ${hashChildren.length} hash-based children`)
    }
  })

  // Generate router/index.js
  console.log('\n📄 Generating router/index.js...')
  const routerContent = generateRouterContent(router)
  fs.writeFileSync(routerFile, routerContent, 'utf8')
  console.log('✅ router/index.js generated\n')

  // Build list of valid flat slugs from sitemap_metadata
  const validFlatSlugs = new Set()
  Object.entries(sitemapMetadata).forEach(([pageName, meta]) => {
    const slug = getSlug(pageName, meta)
    const flatSlug = getFlatSlug(slug)
    if (flatSlug === '/') {
      validFlatSlugs.add('index')
    } else {
      validFlatSlugs.add(flatSlug.substring(1)) // Remove leading /
    }
  })
  // Always preserve 404 page
  validFlatSlugs.add('404')

  // Delete pages not in sitemap_metadata
  console.log('🗑️  Cleaning up pages not in sitemap_metadata...\n')
  let deletedCount = 0

  const existingDirs = fs.readdirSync(pagesDir).filter((item) => {
    const itemPath = path.join(pagesDir, item)
    return fs.statSync(itemPath).isDirectory()
  })

  existingDirs.forEach((dir) => {
    if (!validFlatSlugs.has(dir)) {
      const dirPath = path.join(pagesDir, dir)
      fs.rmSync(dirPath, { recursive: true })
      console.log(`🗑️  Deleted ${dir}`)
      deletedCount++
    }
  })

  if (deletedCount === 0) {
    console.log('   No pages to delete\n')
  } else {
    console.log('')
  }

  // Create page directories
  console.log('📁 Creating page directories and files...\n')

  let createdCount = 0
  let skippedCount = 0
  let fixedCount = 0

  Object.entries(sitemapMetadata).forEach(([pageName, meta]) => {
    // Get flat slug for directory creation
    const slug = getSlug(pageName, meta)
    const flatSlug = getFlatSlug(slug)

    // Handle home page (uses index.vue at root)
    if (flatSlug === '/') {
      const vueFilePath = path.join(pagesDir, 'index.vue')
      if (fs.existsSync(vueFilePath)) {
        const vueContent = fs.readFileSync(vueFilePath, 'utf8')
        const expectedPattern = `setJSONData('${pageName}')`
        const setJSONDataRegex = /setJSONData\(['"]([^'"]+)['"]\)/

        const match = vueContent.match(setJSONDataRegex)
        if (match && match[1] !== pageName) {
          // PageKey is incorrect, fix it
          const updatedContent = vueContent.replace(setJSONDataRegex, expectedPattern)
          fs.writeFileSync(vueFilePath, updatedContent, 'utf8')
          console.log(`🔧 Fixed pageKey in index: '${match[1]}' → '${pageName}'`)
          fixedCount++
        } else {
          console.log('⏭️  Skipping index - home page (pageKey correct)')
          skippedCount++
        }
      } else {
        console.log('⏭️  Skipping index - home page')
        skippedCount++
      }
      return
    }

    const dirName = flatSlug.substring(1) // Remove leading /
    const pageDir = path.join(pagesDir, dirName)

    // Check if directory already exists
    if (fs.existsSync(pageDir)) {
      // Verify and fix pageKey in existing Vue file
      const vueFilePath = path.join(pageDir, 'index.vue')
      if (fs.existsSync(vueFilePath)) {
        const vueContent = fs.readFileSync(vueFilePath, 'utf8')
        const expectedPattern = `setJSONData('${pageName}')`
        const setJSONDataRegex = /setJSONData\(['"]([^'"]+)['"]\)/

        const match = vueContent.match(setJSONDataRegex)
        if (match && match[1] !== pageName) {
          // PageKey is incorrect, fix it
          const updatedContent = vueContent.replace(setJSONDataRegex, expectedPattern)
          fs.writeFileSync(vueFilePath, updatedContent, 'utf8')
          console.log(`🔧 Fixed pageKey in ${dirName}: '${match[1]}' → '${pageName}'`)
          fixedCount++
        } else {
          console.log(`⏭️  Skipping ${dirName} - already exists (pageKey correct)`)
          skippedCount++
        }
      } else {
        console.log(`⏭️  Skipping ${dirName} - already exists`)
        skippedCount++
      }
      return
    }

    // Create directory
    fs.mkdirSync(pageDir, { recursive: true })

    // Generate files using the pageKey
    const { vueFile, pugFile, sassFile } = generatePageFiles(pageName, dirName)

    fs.writeFileSync(path.join(pageDir, 'index.vue'), vueFile, 'utf8')
    fs.writeFileSync(path.join(pageDir, 'index.pug'), pugFile, 'utf8')
    fs.writeFileSync(path.join(pageDir, 'index.sass'), sassFile, 'utf8')

    console.log(`✅ Created ${dirName} (${pageName})`)
    createdCount++
  })

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('✨ Route generation complete!\n')
  console.log('📊 Summary:')
  console.log(`   - Router entries: ${router.length}`)
  console.log(`   - Pages created: ${createdCount}`)
  console.log(`   - Pages fixed: ${fixedCount}`)
  console.log(`   - Pages skipped: ${skippedCount}`)
  console.log(`   - Pages deleted: ${deletedCount}`)
  console.log(`   - Total pages in sitemap: ${Object.keys(sitemapMetadata).length}`)
  console.log('='.repeat(60) + '\n')

  console.log('📋 Next steps:')
  console.log('   1. Run: npm run dev')
  console.log('   2. Test navigation and page loading')
  console.log('   3. Run: npm run lint\n')
}

// Run the script
main()

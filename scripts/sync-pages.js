const fs = require('fs')
const path = require('path')

// Parse router/index.js to extract routes
const parseRouterFile = () => {
  const routerPath = path.join(__dirname, '../router/index.js')
  if (!fs.existsSync(routerPath)) {
    console.error('❌ Error: router/index.js not found!')
    process.exit(1)
  }

  const content = fs.readFileSync(routerPath, 'utf8')

  // Extract the router array using regex
  const routerMatch = content.match(/const router = \[([\s\S]*?)\]\s*\n\s*export default router/)
  if (!routerMatch) {
    console.error('❌ Error: Could not parse router array from router/index.js')
    process.exit(1)
  }

  // Use Function constructor to safely evaluate the array
  // We wrap it to avoid issues with the const declaration
  try {
    const routerArrayStr = '[' + routerMatch[1] + ']'
    // eslint-disable-next-line no-new-func
    const router = new Function('return ' + routerArrayStr)()
    return router
  } catch (err) {
    console.error('❌ Error parsing router:', err.message)
    process.exit(1)
  }
}

// Extract flat slug (directory name) from a path - always gets the last segment
const getDirectoryName = (slug) => {
  if (slug === '/') {
    return 'index'
  }
  // Remove leading/trailing slashes, split by /, and get last segment
  const segments = slug.replace(/^\/|\/$/g, '').split('/')
  return segments[segments.length - 1]
}

// Build a map of all valid pages from router (recursive to handle any depth)
const buildPageMap = (router) => {
  const pageMap = new Map() // dirName -> pageKey (route name)

  const processRoutes = (routes) => {
    routes.forEach((route) => {
      const dirName = getDirectoryName(route.path)
      pageMap.set(dirName, route.name)

      // Recursively process children if present
      if (route.children && route.children.length > 0) {
        processRoutes(route.children)
      }
    })
  }

  processRoutes(router)
  return pageMap
}

// Generate page file templates
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

// Main execution
const main = () => {
  console.log('🚀 Syncing pages directory from router/index.js...\n')

  const projectRoot = path.join(__dirname, '..')
  const pagesDir = path.join(projectRoot, 'pages')

  // Parse router
  const router = parseRouterFile()
  console.log(`📍 Loaded ${router.length} top-level routes from router/index.js`)

  // Build page map
  const pageMap = buildPageMap(router)
  console.log(`📚 Found ${pageMap.size} total pages (including children)\n`)

  // Always preserve 404 page
  pageMap.set('404', '404')

  // Get existing page directories
  const existingDirs = fs.readdirSync(pagesDir).filter((item) => {
    const itemPath = path.join(pagesDir, item)
    return fs.statSync(itemPath).isDirectory()
  })

  // Delete pages not in router
  console.log('🗑️  Checking for pages to delete...\n')
  let deletedCount = 0

  existingDirs.forEach((dir) => {
    if (!pageMap.has(dir)) {
      const dirPath = path.join(pagesDir, dir)
      fs.rmSync(dirPath, { recursive: true })
      console.log(`🗑️  Deleted: ${dir}`)
      deletedCount++
    }
  })

  if (deletedCount === 0) {
    console.log('   No pages to delete\n')
  } else {
    console.log('')
  }

  // Create missing pages and fix pageKeys
  console.log('📁 Checking pages to create/fix...\n')
  let createdCount = 0
  let skippedCount = 0
  let fixedCount = 0

  pageMap.forEach((pageKey, dirName) => {
    // Handle index page (home)
    if (dirName === 'index') {
      const vueFilePath = path.join(pagesDir, 'index.vue')
      if (fs.existsSync(vueFilePath)) {
        const vueContent = fs.readFileSync(vueFilePath, 'utf8')
        const expectedPattern = `setJSONData('${pageKey}')`
        const setJSONDataRegex = /setJSONData\(['"]([^'"]+)['"]\)/

        const match = vueContent.match(setJSONDataRegex)
        if (match && match[1] !== pageKey) {
          const updatedContent = vueContent.replace(setJSONDataRegex, expectedPattern)
          fs.writeFileSync(vueFilePath, updatedContent, 'utf8')
          console.log(`🔧 Fixed pageKey in index: '${match[1]}' → '${pageKey}'`)
          fixedCount++
        } else {
          console.log('⏭️  Skipping index - already exists (pageKey correct)')
          skippedCount++
        }
      } else {
        console.log('⏭️  Skipping index - no index.vue found')
        skippedCount++
      }
      return
    }

    // Handle 404 page
    if (dirName === '404') {
      console.log('⏭️  Skipping 404 - preserved')
      skippedCount++
      return
    }

    const pageDir = path.join(pagesDir, dirName)

    // Check if directory exists
    if (fs.existsSync(pageDir)) {
      // Verify and fix pageKey in existing Vue file
      const vueFilePath = path.join(pageDir, 'index.vue')
      if (fs.existsSync(vueFilePath)) {
        const vueContent = fs.readFileSync(vueFilePath, 'utf8')
        const expectedPattern = `setJSONData('${pageKey}')`
        const setJSONDataRegex = /setJSONData\(['"]([^'"]+)['"]\)/

        const match = vueContent.match(setJSONDataRegex)
        if (match && match[1] !== pageKey) {
          const updatedContent = vueContent.replace(setJSONDataRegex, expectedPattern)
          fs.writeFileSync(vueFilePath, updatedContent, 'utf8')
          console.log(`🔧 Fixed pageKey in ${dirName}: '${match[1]}' → '${pageKey}'`)
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

    // Create new page directory
    fs.mkdirSync(pageDir, { recursive: true })

    const { vueFile, pugFile, sassFile } = generatePageFiles(pageKey, dirName)

    fs.writeFileSync(path.join(pageDir, 'index.vue'), vueFile, 'utf8')
    fs.writeFileSync(path.join(pageDir, 'index.pug'), pugFile, 'utf8')
    fs.writeFileSync(path.join(pageDir, 'index.sass'), sassFile, 'utf8')

    console.log(`✅ Created: ${dirName} (pageKey: '${pageKey}')`)
    createdCount++
  })

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('✨ Page sync complete!\n')
  console.log('📊 Summary:')
  console.log(`   - Pages in router: ${pageMap.size}`)
  console.log(`   - Pages created: ${createdCount}`)
  console.log(`   - Pages fixed: ${fixedCount}`)
  console.log(`   - Pages skipped: ${skippedCount}`)
  console.log(`   - Pages deleted: ${deletedCount}`)
  console.log('='.repeat(60) + '\n')

  console.log('📋 Next steps:')
  console.log('   1. Add page content to data/pages.json for new pages')
  console.log('   2. Run: npm run dev')
  console.log('   3. Test navigation and page loading\n')
}

// Run the script
main()

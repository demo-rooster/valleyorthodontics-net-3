const fs = require('fs')
const https = require('https')
const path = require('path')

const API_URL = 'https://www.valleyorthodontics.net/wp-json/wp/v2/posts'
const POSTS_FILE = path.join(__dirname, '..', 'data', 'posts.json')
const PER_PAGE = 100

const decodeHtml = value => value
  .replace(/&#(\d+);/g, (match, code) => String.fromCharCode(Number(code)))
  .replace(/&#x([0-9a-f]+);/gi, (match, code) => String.fromCharCode(parseInt(code, 16)))
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#0?39;|&apos;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&nbsp;/g, ' ')
  .replace(/&hellip;/g, '...')

const stripHtml = value => decodeHtml(value)
  .replace(/<span class="screen-reader-text">[\s\S]*?<\/span>/g, '')
  .replace(/<a [^>]*class="more-link"[^>]*>[\s\S]*?<\/a>/g, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const formatDate = (value) => {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return `${months[month - 1]} ${day}, ${year}`
}

const requestJSON = url => new Promise((resolve, reject) => {
  https.get(url, { headers: { 'User-Agent': 'valleyorthodontics-post-sync/1.0' } }, (response) => {
    let body = ''
    response.on('data', (chunk) => { body += chunk })
    response.on('end', () => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        reject(new Error(`WordPress returned HTTP ${response.statusCode}`))
        return
      }
      try {
        resolve({
          data: JSON.parse(body),
          totalPages: Number(response.headers['x-wp-totalpages'] || 1)
        })
      } catch (error) {
        reject(new Error(`WordPress returned invalid JSON: ${error.message}`))
      }
    })
  }).on('error', reject)
})

const fetchPosts = async () => {
  const first = await requestJSON(`${API_URL}?status=publish&per_page=${PER_PAGE}&_embed`)
  let posts = first.data
  for (let page = 2; page <= first.totalPages; page++) {
    const next = await requestJSON(`${API_URL}?status=publish&per_page=${PER_PAGE}&page=${page}&_embed`)
    posts = posts.concat(next.data)
  }
  return posts
}

const getImage = (post) => {
  const embedded = post._embedded && post._embedded['wp:featuredmedia']
  const media = embedded && embedded[0]
  if (!media) {
    return null
  }
  const sizes = (media.media_details && media.media_details.sizes) || {}
  return {
    thumbnail: (sizes.medium_large && sizes.medium_large.source_url) || media.source_url,
    main: (sizes.large && sizes.large.source_url) || media.source_url,
    social: media.source_url,
    alt: media.alt_text || decodeHtml(post.title.rendered)
  }
}

const createLocalPost = (post) => {
  const title = decodeHtml(post.title.rendered)
  const description = stripHtml(post.excerpt.rendered)
  const image = getImage(post)
  const imageData = source => ({
    src: source,
    webp: source,
    alt: image ? image.alt : title,
    bgColor: '#ffffff',
    imageBackground: false
  })
  const content = post.content.rendered.replace(/^<p><img[\s\S]*?<\/p>\s*/, '')

  return {
    id: post.id,
    title,
    slug: post.slug,
    path: `/blog/${post.slug}`,
    date: post.date,
    category: post.categories ? post.categories[0] : null,
    post: {
      title,
      slug: post.slug,
      seo: {
        page_title: title,
        page_description: description,
        social_meta: {
          og_meta: {
            title,
            description,
            image: image ? image.social : ''
          }
        }
      },
      blog_post: {
        title,
        date: formatDate(post.date),
        excerpt: description,
        thumbnail_image: imageData(image ? image.thumbnail : ''),
        main_image: imageData(image ? image.main : ''),
        paragraphs: [{ header: '', body: content }]
      }
    }
  }
}

const refreshLocalPost = (local, remote) => {
  const title = decodeHtml(remote.title.rendered)
  return {
    ...local,
    id: remote.id,
    title,
    slug: remote.slug,
    path: `/blog/${remote.slug}`,
    date: remote.date,
    category: remote.categories ? remote.categories[0] : null,
    post: {
      ...local.post,
      title,
      slug: remote.slug
    }
  }
}

const hasCurrentImage = (local, remote) => {
  const remoteImage = getImage(remote)
  const localImage = local.post && local.post.blog_post && local.post.blog_post.main_image
  if (!remoteImage) {
    return !localImage || !localImage.src
  }
  if (!localImage || !localImage.src) {
    return false
  }
  const remoteName = path.basename(new URL(remoteImage.social).pathname).replace(/-\d+x\d+(?=\.[^.]+$)/, '')
  const localName = path.basename(new URL(localImage.src).pathname).replace(/-\d+x\d+(?=\.[^.]+$)/, '')
  return remoteName === localName
}

const main = async () => {
  const localData = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'))
  const localBySlug = new Map((localData.posts || []).map(post => [post.slug, post]))
  const remotePosts = await fetchPosts()
  const posts = remotePosts
    .map((post) => {
      const localPost = localBySlug.get(post.slug)
      return localPost && localPost.id === post.id && hasCurrentImage(localPost, post)
        ? refreshLocalPost(localPost, post)
        : createLocalPost(post)
    })
    .sort((left, right) => new Date(right.date) - new Date(left.date))
  const postsPerPage = {}

  for (let index = 0; index < posts.length; index += PER_PAGE) {
    postsPerPage[String((index / PER_PAGE) + 1)] = posts.slice(index, index + PER_PAGE)
  }

  const output = {
    posts,
    postsPerPage,
    pageCount: Math.max(1, Math.ceil(posts.length / PER_PAGE))
  }
  fs.writeFileSync(POSTS_FILE, `${JSON.stringify(output, null, 2)}\n`)
  console.log(`Synced ${posts.length} published WordPress posts to data/posts.json`)
}

main().catch((error) => {
  console.error(`Post sync failed: ${error.message}`)
  process.exitCode = 1
})

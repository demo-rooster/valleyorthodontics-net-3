import fs from 'fs'
import path from 'path'
import {
  contentDraftStorageKey,
  contentDraftStorageVersion,
  createSection,
  getBasePage,
  getPageCatalog,
  getPageKeyForPath,
  readContentDraftState,
  readContentDrafts,
  renderedSectionLayouts,
  sectionTemplates,
  writeContentDrafts
} from '~/resources/content-builder'

describe('content builder', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  test('maps catalog routes back to page keys', () => {
    const home = getPageCatalog().find(page => page.key === 'Home')

    expect(home.path).toBe('/')
    expect(getPageKeyForPath('/')).toBe('Home')
    expect(getPageKeyForPath('/about/')).toBe('About')
  })

  test('separates SEO and assigns deterministic section IDs', () => {
    const first = getBasePage('Home')
    const second = getBasePage('home')

    expect(first.sections.length).toBeGreaterThan(0)
    expect(first.sections.some(section => section.seo)).toBe(false)
    expect(first.seo).toBeTruthy()
    expect(first.sections.map(section => section.__builder_id))
      .toEqual(second.sections.map(section => section.__builder_id))
  })

  test('persists only supported draft versions', () => {
    const pages = { Home: getBasePage('Home') }
    const savedAt = { Home: '2026-07-23T12:00:00.000Z' }

    writeContentDrafts(pages, savedAt)
    expect(readContentDrafts().Home.sections).toHaveLength(pages.Home.sections.length)
    expect(readContentDraftState().savedAt).toEqual(savedAt)

    writeContentDrafts({})
    expect(window.localStorage.getItem(contentDraftStorageKey)).toBeNull()

    window.localStorage.setItem(contentDraftStorageKey, JSON.stringify({
      version: `${contentDraftStorageVersion}-future`,
      pages
    }))
    expect(readContentDrafts()).toEqual({})
  })

  test('creates renderer-safe text section defaults', () => {
    const section = createSection('block_text_simple')

    expect(section.paragraphs).toEqual([{ text: 'Add your content here.' }])
    expect(section.component_options.hide_component).toBe(false)
    expect(section.__builder_id).toBeTruthy()
  })

  test('provides a curated template for every rendered section layout', () => {
    const template = fs.readFileSync(path.resolve(process.cwd(), 'components/page-sections/index.pug'), 'utf8')
    const renderedLayouts = [...template.matchAll(/acf_fc_layout === "([^"]+)"/g)]
      .map(match => match[1])

    expect([...new Set(renderedLayouts)].sort()).toEqual([...renderedSectionLayouts].sort())
    expect(Object.keys(sectionTemplates).sort()).toEqual([...renderedSectionLayouts].sort())

    renderedSectionLayouts.forEach((layout) => {
      const section = createSection(layout)

      expect(section.acf_fc_layout).toBe(layout)
      expect(section.__builder_id).toBeTruthy()
      expect(section.component_options.hide_component).toBe(false)
    })
  })

  test('creates non-empty defaults for renderers that dereference first items', () => {
    expect(createSection('before_after_slider').slides).toHaveLength(1)
    expect(createSection('single_image_slider').slides).toHaveLength(1)
    expect(createSection('single_video_slider').slides[0]).toHaveProperty('title')
    expect(createSection('form').form[0]).toBeTruthy()
    expect(createSection('accordion').accordion[0].paragraphs).toHaveLength(1)
  })
})

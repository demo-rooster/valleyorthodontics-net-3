import { getIconCatalog, getMediaCatalog } from '~/resources/builder-assets'

describe('builder asset catalogs', () => {
  test('catalogs referenced images and videos without ordinary links', () => {
    const catalog = getMediaCatalog()

    expect(catalog.some(asset => asset.type === 'image' && asset.src.includes('Dr_-Rocha.webp'))).toBe(true)
    expect(catalog.some(asset => asset.type === 'video' && asset.src.includes('home-hero-full-1080p.mp4'))).toBe(true)
    expect(catalog.some(asset => asset.src.includes('facebook.com/valleyorthomarin'))).toBe(false)
    expect(catalog.some(asset => asset.src.startsWith('tel:'))).toBe(false)
  })

  test('leaves icon discovery to webpack contexts', () => {
    expect(getIconCatalog()).toEqual([])
  })
})

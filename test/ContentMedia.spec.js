import { filterIconNames, filterMediaAssets, mediaPreviewSource, mergeMediaAsset } from '~/resources/content-media'

describe('content media behavior', () => {
  const assets = [
    { type: 'image', label: 'Doctor portrait', src: '{{cdn}}/doctor.jpg', alt: 'Doctor' },
    { type: 'image', label: 'Office exterior', src: '/office.jpg' },
    { type: 'video', label: 'Welcome video', src: '/welcome.mp4', poster: '/poster.jpg' }
  ]

  test('filters by media type and semantic search text', () => {
    expect(filterMediaAssets(assets, 'image')).toHaveLength(2)
    expect(filterMediaAssets(assets, 'image', 'doctor')).toEqual([assets[0]])
    expect(filterMediaAssets(assets, 'video', 'portrait')).toEqual([])
  })

  test('resolves poster and CDN preview sources', () => {
    expect(mediaPreviewSource(assets[0], 'https://cdn.test')).toBe('https://cdn.test/doctor.jpg')
    expect(mediaPreviewSource(assets[2])).toBe('/poster.jpg')
  })

  test('merges media metadata without leaking catalog-only fields', () => {
    const result = mergeMediaAsset({ src: '', alt: 'Keep only when absent' }, assets[0])

    expect(result).toEqual({ src: '{{cdn}}/doctor.jpg', alt: 'Doctor' })
    expect(result).not.toHaveProperty('label')
    expect(result).not.toHaveProperty('type')
  })

  test('filters icon names without changing their catalog order', () => {
    const icons = ['arrow-left', 'phone', 'arrow-right']

    expect(filterIconNames(icons, 'arrow')).toEqual(['arrow-left', 'arrow-right'])
    expect(filterIconNames(icons)).toEqual(icons)
  })
})

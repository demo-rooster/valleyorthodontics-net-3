import {
  addPathItem,
  describeObject,
  duplicatePathItem,
  defaultArrayItem,
  getPathValue,
  movePathItem,
  removePathItem,
  setPathValue
} from '~/resources/content-editor-schema'

describe('content editor schema', () => {
  const section = {
    __builder_id: 'section-1',
    title: 'Title',
    enabled: true,
    image: { src: 'one.jpg', alt: 'One' },
    items: [{ title: 'First' }, { title: 'Second' }]
  }

  test('updates a nested path without mutating its source', () => {
    const updated = setPathValue(section, ['image', 'alt'], 'Updated')

    expect(updated.image.alt).toBe('Updated')
    expect(updated.title).toBe('Title')
    expect(section.image.alt).toBe('One')
  })

  test('supports nested array CRUD and ordering', () => {
    const added = addPathItem(section, ['items'], { title: 'Third' })
    const duplicated = duplicatePathItem(added, ['items'], 0)
    const moved = movePathItem(duplicated, ['items'], 0, 1)
    const removed = removePathItem(moved, ['items'], 2)

    expect(getPathValue(added, ['items'])).toHaveLength(3)
    expect(duplicated.items[1]).toEqual({ title: 'First' })
    expect(moved.items[0]).toEqual({ title: 'First' })
    expect(removed.items).toHaveLength(3)
    expect(section.items).toHaveLength(2)
  })

  test('classifies fields and hides internal values', () => {
    const fields = describeObject(section)

    expect(fields.find(field => field.key === '__builder_id')).toBeUndefined()
    expect(fields.find(field => field.key === 'enabled').type).toBe('boolean')
    expect(fields.find(field => field.key === 'image').type).toBe('image')
    expect(fields.find(field => field.key === 'items').type).toBe('array')
  })

  test('creates renderer-safe defaults for empty repeaters', () => {
    expect(defaultArrayItem([], 'paragraphs')).toEqual({ text: '' })
    expect(defaultArrayItem([], 'buttons').button.type).toBe('nuxt')
    expect(defaultArrayItem([], 'accordion').image).toHaveProperty('src', '')
    expect(defaultArrayItem([], 'social_links')).toEqual({ href: '', icon: '' })
  })
})

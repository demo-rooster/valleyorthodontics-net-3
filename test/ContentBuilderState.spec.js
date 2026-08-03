import { confirmDiscardChanges, getDraftStatus, setSEOValue } from '~/resources/content-builder-state'

describe('content builder state', () => {
  const baseline = { sections: [{ title: 'Published' }], seo: { page_title: 'Published' } }

  test('distinguishes saved and unsaved working pages', () => {
    expect(getDraftStatus(baseline, baseline, null)).toBe('saved')
    expect(getDraftStatus({ ...baseline, seo: { page_title: 'Draft' } }, baseline, null)).toBe('unsaved')
    expect(getDraftStatus(null, baseline, null)).toBe('unavailable')
  })

  test('uses the saved draft as the comparison point', () => {
    const saved = { ...baseline, seo: { page_title: 'Saved draft' } }

    expect(getDraftStatus(saved, baseline, saved)).toBe('saved')
    expect(getDraftStatus(baseline, baseline, saved)).toBe('unsaved')
  })

  test('only confirms navigation when changes are unsaved', () => {
    const confirm = jest.fn(() => false)

    expect(confirmDiscardChanges(false, confirm)).toBe(true)
    expect(confirm).not.toHaveBeenCalled()
    expect(confirmDiscardChanges(true, confirm)).toBe(false)
    expect(confirm).toHaveBeenCalledTimes(1)
  })

  test('updates nested SEO without mutating its source', () => {
    const seo = { social_meta: { og_meta: { title: 'Original' } } }
    const result = setSEOValue(seo, ['social_meta', 'og_meta', 'title'], 'Updated')

    expect(result.social_meta.og_meta.title).toBe('Updated')
    expect(seo.social_meta.og_meta.title).toBe('Original')
  })
})

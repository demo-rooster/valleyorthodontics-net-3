import { sanitizeBuilderHTML } from '~/resources/content-builder-fields.client'

describe('direct content editing', () => {
  test('preserves safe formatting and strips presentation attributes', () => {
    const value = sanitizeBuilderHTML('<p class="large">Text <strong style="color:red">bold</strong><br></p>')

    expect(value).toBe('<p>Text <strong>bold</strong><br></p>')
  })

  test('removes executable markup and unsafe link protocols', () => {
    const value = sanitizeBuilderHTML('<script>alert(1)</script><a href="javascript:alert(1)" onclick="alert(1)">Bad</a><a href="/safe">Safe</a>')

    expect(value).toBe('<a>Bad</a><a href="/safe">Safe</a>')
  })
})

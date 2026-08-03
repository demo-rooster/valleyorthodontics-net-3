import Vue from 'vue'

const allowedTags = new Set(['A', 'B', 'BR', 'EM', 'I', 'LI', 'OL', 'P', 'SPAN', 'STRONG', 'U', 'UL'])
const blockedTags = new Set(['IFRAME', 'OBJECT', 'SCRIPT', 'STYLE'])
const safeLink = value => /^(https?:|mailto:|tel:|\/|#)/i.test(value.trim())

export const sanitizeBuilderHTML = (value) => {
  const template = document.createElement('template')
  template.innerHTML = value

  template.content.querySelectorAll('*').forEach((element) => {
    if (blockedTags.has(element.tagName)) {
      element.remove()
      return
    }

    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...element.childNodes)
      return
    }

    ;[...element.attributes].forEach((attribute) => {
      const keepLinkAttribute = element.tagName === 'A' && ['href', 'rel', 'target'].includes(attribute.name)

      if (!keepLinkAttribute || (attribute.name === 'href' && !safeLink(attribute.value))) {
        element.removeAttribute(attribute.name)
      }
    })
  })

  return template.innerHTML.trim()
}

const sectionIdFor = element => element.closest('[data-builder-id]')?.dataset.builderId

const selectSection = (element) => {
  const sectionId = sectionIdFor(element)

  if (sectionId) {
    window.dispatchEvent(new CustomEvent('rg-select-content-section', {
      detail: { id: sectionId, shouldScroll: false }
    }))
  }
}

const setEditingState = (element, vnode) => {
  const enabled = !!vnode.context.$store.state.customizationEnabled
  element.contentEditable = enabled ? 'true' : 'false'
  element.classList.toggle('builder-editable-field', enabled)
  element.setAttribute('data-builder-field', vnode.data.directives.find(item => item.name === 'builder-field').value.join('.'))
  element.setAttribute('spellcheck', enabled ? 'true' : 'false')
}

Vue.directive('builder-field', {
  bind (element, binding, vnode) {
    setEditingState(element, vnode)

    element.__builderFieldPath = binding.value
    element.__builderFieldOriginal = ''
    element.__builderFieldHandlers = {
      focus () {
        element.__builderFieldOriginal = element.innerHTML
        selectSection(element)
      },
      keydown (event) {
        if (event.key === 'Escape') {
          event.preventDefault()
          element.innerHTML = element.__builderFieldOriginal
          element.blur()
        }
      },
      blur () {
        const sectionId = sectionIdFor(element)
        const value = sanitizeBuilderHTML(element.innerHTML)

        element.innerHTML = value
        if (sectionId && value !== element.__builderFieldOriginal) {
          window.dispatchEvent(new CustomEvent('rg-content-field-commit', {
            detail: { sectionId, path: element.__builderFieldPath, value }
          }))
        }
      }
    }

    Object.entries(element.__builderFieldHandlers).forEach(([event, handler]) => element.addEventListener(event, handler))
  },
  update (element, binding, vnode) {
    element.__builderFieldPath = binding.value
    setEditingState(element, vnode)
  },
  unbind (element) {
    Object.entries(element.__builderFieldHandlers || {}).forEach(([event, handler]) => element.removeEventListener(event, handler))
    delete element.__builderFieldHandlers
  }
})

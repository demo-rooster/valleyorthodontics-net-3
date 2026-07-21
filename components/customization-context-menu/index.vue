<template lang='pug' src='./index.pug'></template>

<script>
const buttonSelector = 'button, .base-button, .base-button-simple, .base-button-caret, .block-button'
const headingSelector = 'h1, h2, h3, h4, h5, h6'
const textSelector = 'p, li, blockquote, span, a'
const sectionContainerSelector = '.page-sections__section-container'
const contextMenuCheckpointEvent = 'rg-theme-checkpoint'
const viewportMargin = 8
const roleLabels = {
  titles: 'Titles',
  text: 'Body text',
  'btn-background': 'Button background',
  'btn-text': 'Button text',
  'btn-hover-background': 'Hover background',
  'btn-hover-text': 'Hover text',
  background: 'Section background'
}
const buttonRoles = {
  normal: {
    background: 'btn-background',
    text: 'btn-text'
  },
  hover: {
    background: 'btn-hover-background',
    text: 'btn-hover-text'
  }
}

export default {
  data: () => ({
    visible: false,
    x: 0,
    y: 0,
    role: null,
    sectionKey: null,
    sectionLabel: '',
    isButtonContext: false,
    buttonState: 'normal',
    buttonProperty: 'background',
    buttonStateOptions: [
      { key: 'normal', label: 'Normal' },
      { key: 'hover', label: 'Hovered' }
    ],
    buttonPropertyOptions: [
      { key: 'background', label: 'Background' },
      { key: 'text', label: 'Text' }
    ]
  }),
  computed: {
    theme () {
      return this.$store.state.theme
    },
    themeScheme () {
      return this.theme?.scheme || []
    },
    activeRole () {
      if (!this.isButtonContext) {
        return this.role
      }

      return buttonRoles[this.buttonState][this.buttonProperty]
    },
    roleLabel () {
      return roleLabels[this.activeRole] || this.activeRole
    },
    overrideRef () {
      if (!this.sectionKey || !this.activeRole) {
        return null
      }

      const overrides = this.theme?.sectionOverrides || {}

      return (overrides[this.sectionKey] || {})[this.activeRole] || null
    },
    menuStyle () {
      return {
        top: `${this.y}px`,
        left: `${this.x}px`
      }
    }
  },
  watch: {
    $route () {
      this.closeMenu()
    }
  },
  mounted () {
    document.addEventListener('contextmenu', this.handleContextMenu)
    document.addEventListener('mousedown', this.handleOutsideMousedown)
    document.addEventListener('keydown', this.handleKeydown)
    window.addEventListener('scroll', this.closeMenu, { capture: true, passive: true })
    window.addEventListener('resize', this.closeMenu)
  },
  beforeDestroy () {
    document.removeEventListener('contextmenu', this.handleContextMenu)
    document.removeEventListener('mousedown', this.handleOutsideMousedown)
    document.removeEventListener('keydown', this.handleKeydown)
    window.removeEventListener('scroll', this.closeMenu, { capture: true })
    window.removeEventListener('resize', this.closeMenu)
  },
  methods: {
    handleContextMenu (event) {
      if (!this.$store.state.customizationEnabled || !this.themeScheme.length) {
        return
      }

      const target = event.target instanceof Element ? event.target : null
      const container = target && target.closest(sectionContainerSelector)

      if (!container) {
        return
      }

      event.preventDefault()

      this.isButtonContext = !!target.closest(buttonSelector)
      this.buttonState = 'normal'
      this.buttonProperty = 'background'
      this.role = this.detectRole(target)
      this.sectionKey = this.getSectionKey(container)
      this.sectionLabel = this.getSectionLabel(container)
      this.x = event.clientX
      this.y = event.clientY
      this.visible = true

      this.$nextTick(this.clampToViewport)
    },
    detectRole (target) {
      if (target.closest(buttonSelector)) {
        return 'btn-background'
      }

      if (target.closest(headingSelector)) {
        return 'titles'
      }

      if (target.closest(textSelector)) {
        return 'text'
      }

      return 'background'
    },
    getSectionKey (container) {
      const section = container.querySelector('.page-sections__section[id]')
      const sectionId = section ? section.id : 'section'

      return `${this.$route.path}::${sectionId}`
    },
    getSectionLabel (container) {
      const section = container.querySelector('.page-sections__section[id]')

      return section ? section.id.replace(/[-_]/g, ' ') : 'this section'
    },
    clampToViewport () {
      const menu = this.$refs.menu

      if (!menu) {
        return
      }

      this.x = Math.max(viewportMargin, Math.min(this.x, window.innerWidth - menu.offsetWidth - viewportMargin))
      this.y = Math.max(viewportMargin, Math.min(this.y, window.innerHeight - menu.offsetHeight - viewportMargin))
    },
    handleOutsideMousedown (event) {
      if (!this.visible) {
        return
      }

      const menu = this.$refs.menu

      if (menu && event.target instanceof Element && !menu.contains(event.target)) {
        this.closeMenu()
      }
    },
    handleKeydown (event) {
      if (event.key === 'Escape') {
        this.closeMenu()
      }
    },
    closeMenu () {
      this.visible = false
    },
    recordCheckpoint () {
      window.dispatchEvent(new CustomEvent(contextMenuCheckpointEvent, {
        detail: { editKey: `override:${this.sectionKey}:${this.activeRole}` }
      }))
    },
    applyOverride (payload) {
      if (!this.sectionKey || !this.activeRole) {
        return
      }

      this.recordCheckpoint()
      this.$store.dispatch('SET_SECTION_OVERRIDE', {
        sectionKey: this.sectionKey,
        role: this.activeRole,
        slotRef: payload.ref
      })
    },
    resetOverride () {
      if (!this.overrideRef) {
        return
      }

      this.recordCheckpoint()
      this.$store.dispatch('SET_SECTION_OVERRIDE', {
        sectionKey: this.sectionKey,
        role: this.activeRole,
        slotRef: null
      })
    }
  }
}
</script>

<style lang='sass' src='./index.sass'></style>

<template lang='pug' src='./index.pug'></template>

<script>
import { fadeUpIn } from '~/resources/mixins'
import BlockButtons from '~/components/block/block-buttons'

export default {
  components: {
    BlockButtons
  },
  mixins: [fadeUpIn],
  props: {
    props: {
      type: Object,
      default: () => ({})
    },
    buttons: {
      type: Array,
      default: () => ([])
    },
    makeActive: {
      type: Function,
      default: () => ({})
    }
  },
  data: () => ({
    expandedSection: 0
  }),
  mounted () {
    this.$nextTick(() => {
      this.setComponentHeight()
      if (this.$refs.itBtns) {
        this.$_fadeUpIn(this.$refs.itBtns.$el, 32, 'bottom bottom')
      }
      // Set initial height for the default open section (index 0)
      setTimeout(() => {
        this.setComponentHeight()
        if (this.$refs.sections && this.$refs.sections[0]) {
          this.$refs.sections[0].style.height = this.$refs.sections[0].scrollHeight + 'px'
        }
      }, 100)
    })
    window.addEventListener('resize', this.setComponentHeight)
  },
  destroyed () {
    window.removeEventListener('resize', this.setComponentHeight)
  },
  methods: {
    sanitizeId (str) {
      return str.replace(/[^a-zA-Z0-9-_]/g, '-')
    },
    openAccordion (i) {
      // Add safety check for refs
      if (!this.$refs.sections || !this.$refs.sections[i]) {
        return
      }

      if (this.expandedSection === null) {
        this.expandedSection = i
        this.$refs.sections[i].style.height = this.$refs.sections[i].scrollHeight + 'px'
      } else if (this.expandedSection === i) {
        this.expandedSection = null
        this.$refs.sections[i].style.height = 0
      } else {
        // Close currently expanded section
        if (this.$refs.sections[this.expandedSection]) {
          this.$refs.sections[this.expandedSection].style.height = 0
        }
        this.expandedSection = i
        this.$refs.sections[i].style.height = this.$refs.sections[i].scrollHeight + 'px'
      }
      this.$emit('open-tab', i)
    },
    setComponentHeight () {
      const component = this.$refs.main
      if (!component) {
        return
      }
      if (window.innerWidth > 480) {
        setTimeout(() => {
          const headers = this.$refs.headers
          const sections = this.$refs.sections

          // Add safety checks
          if (!headers || !sections) {
            return
          }

          const headersHeights = headers.map(header => header.scrollHeight)
          const sectionsHeights = sections.map(section => section.scrollHeight)
          const sectionMaxHeight = Math.max(...sectionsHeights)
          const headerTotalHeight = headersHeights.reduce((partialSum, a) => partialSum + a, 0)
          component.style.height = sectionMaxHeight + headerTotalHeight + 'px'
        }, 100) // Reduced timeout to prevent interference
      } else {
        component.style.height = ''
      }
    }
  }
}
</script>

<style lang='sass' src='./index.sass'></style>

<template lang='pug' src='./index.pug'></template>

<script>
import { fadeUpIn } from '~/resources/mixins'
import BlockButton from '~/components/block/block-button'

export default {
  components: {
    BlockButton
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
  data () {
    return {
      expandedSection: this.props.start_collapsed ? null : 0,
      heightSyncTimers: []
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.setComponentHeight()
      if (this.$refs.itBtns) {
        this.$_fadeUpIn(this.$refs.itBtns.$el, 32, 'bottom bottom')
      }
      this.queueHeightSync()
    })
    window.addEventListener('resize', this.setComponentHeight)
  },
  destroyed () {
    this.heightSyncTimers.forEach(timer => clearTimeout(timer))
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
      this.queueHeightSync()
    },
    queueHeightSync () {
      this.heightSyncTimers.forEach(timer => clearTimeout(timer))
      this.heightSyncTimers = [100, 400, 900, 1500].map((delay) => {
        return setTimeout(() => {
          this.setComponentHeight()
          this.syncExpandedSectionHeight()
        }, delay)
      })
    },
    syncExpandedSectionHeight () {
      if (this.expandedSection === null || !this.$refs.sections || !this.$refs.sections[this.expandedSection]) {
        return
      }
      this.$refs.sections[this.expandedSection].style.height = this.$refs.sections[this.expandedSection].scrollHeight + 'px'
    },
    setComponentHeight () {
      const component = this.$refs.main
      if (!component) {
        return
      }
      if (this.props.acf_fc_layout === 'accordion') {
        component.style.height = ''
        this.syncExpandedSectionHeight()
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
          this.syncExpandedSectionHeight()
        }, 100) // Reduced timeout to prevent interference
      } else {
        component.style.height = ''
        this.syncExpandedSectionHeight()
      }
    }
  }
}
</script>

<style lang='sass' src='./index.sass'></style>

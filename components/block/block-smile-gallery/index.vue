<template lang="pug" src="./index.pug"></template>

<script>
import { debounce, removeFocus, fadeUpIn } from '~/resources/mixins'
import BlockComparisonSlider from '~/components/block/block-comparison-slider'

export default {
  components: {
    BlockComparisonSlider
  },
  mixins: [debounce, removeFocus, fadeUpIn],
  props: {
    props: {
      type: Object,
      default: () => ({})
    }
  },
  data: () => ({
    selectedCase: null,
    currentIndex: 0
  }),
  computed: {
    categories () {
      return this.props.categories || []
    },
    allCases () {
      const cases = []
      this.categories.forEach((cat) => {
        if (cat.cases) {
          cat.cases.forEach((c) => {
            cases.push({ ...c, categoryName: cat.name })
          })
        }
      })
      return cases
    }
  },
  mounted () {
    window.addEventListener('keydown', this.handleKeydown)
  },
  beforeDestroy () {
    window.removeEventListener('keydown', this.handleKeydown)
    document.body.style.overflow = ''
  },
  methods: {
    openModal (_, catIndex, caseIndex) {
      let index = 0
      for (let i = 0; i < catIndex; i++) {
        index += this.categories[i]?.cases?.length || 0
      }
      index += caseIndex

      this.currentIndex = index
      this.selectedCase = this.allCases[index]
      document.body.style.overflow = 'hidden'
    },
    closeModal () {
      this.selectedCase = null
      document.body.style.overflow = ''
    },
    nextCase () {
      this.currentIndex = (this.currentIndex + 1) % this.allCases.length
      this.selectedCase = this.allCases[this.currentIndex]
    },
    prevCase () {
      this.currentIndex = (this.currentIndex - 1 + this.allCases.length) % this.allCases.length
      this.selectedCase = this.allCases[this.currentIndex]
    },
    handleKeydown (e) {
      if (!this.selectedCase) { return }
      if (e.key === 'Escape') {
        this.closeModal()
      } else if (e.key === 'ArrowLeft') {
        this.prevCase()
      } else if (e.key === 'ArrowRight') {
        this.nextCase()
      }
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

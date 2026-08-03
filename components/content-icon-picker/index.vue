<template lang='pug' src='./index.pug'></template>

<script>
import { filterIconNames } from '~/resources/content-media'

const pageSize = 48

export default {
  props: {
    icons: {
      type: Array,
      default: () => []
    },
    value: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    isOpen: false,
    query: '',
    visibleCount: pageSize
  }),
  computed: {
    filteredIcons () {
      return filterIconNames(this.icons, this.query)
    },
    visibleIcons () {
      return this.filteredIcons.slice(0, this.visibleCount)
    },
    hasMore () {
      return this.visibleCount < this.filteredIcons.length
    }
  },
  watch: {
    query () {
      this.visibleCount = pageSize
    }
  },
  methods: {
    toggle () {
      this.isOpen = !this.isOpen
      if (!this.isOpen) {
        this.query = ''
      }
    },
    selectIcon (icon) {
      this.$emit('input', icon)
      this.isOpen = false
      this.query = ''
    },
    showMore () {
      this.visibleCount += pageSize
    }
  }
}
</script>

<style lang='sass' src='./index.sass'></style>

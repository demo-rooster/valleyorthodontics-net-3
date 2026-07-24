<template lang='pug' src='./index.pug'></template>

<script>
import { cdn } from '~/resources/api'
import { filterMediaAssets, mediaPreviewSource } from '~/resources/content-media'

const pageSize = 24

export default {
  props: {
    assets: {
      type: Array,
      default: () => []
    },
    currentSrc: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      required: true
    }
  },
  data: () => ({
    isOpen: false,
    query: '',
    visibleCount: pageSize
  }),
  computed: {
    label () {
      return this.type === 'image' ? 'image' : 'video'
    },
    filteredAssets () {
      return filterMediaAssets(this.assets, this.type, this.query)
    },
    visibleAssets () {
      return this.filteredAssets.slice(0, this.visibleCount)
    },
    hasMore () {
      return this.visibleCount < this.filteredAssets.length
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
    previewSrc (asset) {
      return mediaPreviewSource(asset, cdn)
    },
    selectAsset (asset) {
      this.$emit('select', asset)
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

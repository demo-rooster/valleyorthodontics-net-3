<template lang='pug' src='./index.pug'></template>

<script>
import { fadeUpIn } from '~/resources/mixins'
import BlockAccordion from '~/components/block/block-accordion'

export default {
  components: {
    BlockAccordion
  },
  mixins: [fadeUpIn],
  props: {
    props: {
      type: Object,
      default: () => ({})
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.$refs.itParagraphs) {
        this.$_fadeUpIn(this.$refs.itParagraphs.$el, 32, 'bottom bottom')
      }
    })
  }
}
</script>

<style lang='sass' src='./index.sass'></style>

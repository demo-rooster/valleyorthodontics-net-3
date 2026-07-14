<template lang='pug' src='./index.pug'></template>

<script>
import { setJSONData } from '~/resources/utils'

export default {
  props: {
    props: {
      type: Object,
      default: () => ({})
    }
  },
  data: () => ({
    global: null
  }),
  computed: {
    buttonStyles () {
      const style = this.props?.style || 'primary'
      let bgColorLabel = 'accent'

      if (style === 'secondary') {
        bgColorLabel = 'primary'
      } else if (style === 'primary') {
        bgColorLabel = 'accent'
      }

      return {
        '--block-btn-bg': `var(--${bgColorLabel})`
      }
    }
  },
  async fetch () {
    this.global = await setJSONData('global', 'globalData')
  },
  methods: {
    handleClick () {
      // Add custom functionality ================

      // this.$emit('emit-function-name', true)
      console.log('button clicked')
    },
    handleAnimation () {
      // this.$_fadeIn(this.$refs.button, 0, 32, 'top', 0, 1.25)
    }
  }
}
</script>

<style lang='sass' src='./index.sass'></style>

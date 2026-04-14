<template lang="pug" src="./index.pug" ></template>

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
    }
  },
  mounted () {
    if (this.props.title) {
      this.titleAnimation()
    }
    this.$refs.paragraphs.forEach((item, i) => {
      this.$_fadeUpIn(item, 48, 'center+48')
    })
    if (this.props.has_button) {
      this.$_fadeUpIn('.block-masonary-grid__cta', 32, 'bottom')
    }
  },
  methods: {
    handleCtaClick () {
      // Enter logic here for the CTA button
      console.log('click CTA')
    },
    titleAnimation () {
      this.$CustomEase.create('customEaseOut', '0.23, 1, 0.32, 1')
      const theTitle = this.$refs.theTitle
      const tl = this.$gsap.timeline({
        scrollTrigger: {
          trigger: theTitle,
          start: 'bottom bottom'
        }
      })

      const titleSplit = new this.$SplitText(theTitle, { type: 'lines' })

      tl.from(titleSplit.lines, {
        y: '32',
        opacity: 0,
        duration: 1,
        stagger: 0.115,
        ease: 'customEaseOut'
      })
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

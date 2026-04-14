<template lang='pug' src='./index.pug'></template>

<script>
import BlockAccordionFull from '~/components/block/block-accordion-full'
import BlockBanner from '~/components/block/block-banner'
import BlockBeforeAfterSlider from '~/components/block/block-before-after-slider'
import BlockSmileGallery from '~/components/block/block-smile-gallery'
import BlockContact from '~/components/block/block-contact'
import BlockContactForm from '~/components/block/block-contact-form'
import BlockGrid from '~/components/block/block-grid'
import BlogPosts from '~/components/block/block-repeater-post'
import BlockImage from '~/components/block/block-image'
import BlockImageText from '~/components/block/block-image-text'
import BlockItemRow from '~/components/block/block-item-row'
import BlockLogoBanner from '~/components/block/block-logo-banner'
import BlockMasonaryGrid from '~/components/block/block-masonary-grid'
import BlockMultiTestimonial from '~/components/block/block-multi-testimonial'
import BlockSingleImageSlider from '~/components/block/block-single-image-slider'
import BlockSingleTestimonial from '~/components/block/block-single-testimonial'
import BlockSingleVideoSlider from '~/components/block/block-single-video-slider'
import BlockTabs from '~/components/block/block-tabs'
import BlockTextFH from '~/components/block/block-text-fh'
import BlockTextSimple from '~/components/block/block-text-simple'
import TheHero from '~/components/hero/hero-main'

export default {
  transition: 'fade',
  components: {
    BlockAccordionFull,
    BlockBanner,
    BlockBeforeAfterSlider,
    BlockSmileGallery,
    BlockContact,
    BlockContactForm,
    BlockGrid,
    BlockImage,
    BlockImageText,
    BlockItemRow,
    BlockLogoBanner,
    BlockMasonaryGrid,
    BlockMultiTestimonial,
    BlockSingleImageSlider,
    BlockSingleTestimonial,
    BlockSingleVideoSlider,
    BlockTabs,
    BlockTextFH,
    BlockTextSimple,
    BlogPosts,
    TheHero
  },
  props: {
    props: {
      type: Array,
      default: () => ([])
    },
    pageTitle: {
      type: String,
      default: () => ('')
    }
  },
  mounted () {
    this.$nextTick(() => {
      setTimeout(() => {
        this.$store.dispatch('VIEW_SITE', true)
      }, 100)
    })
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

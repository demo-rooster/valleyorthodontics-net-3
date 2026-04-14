<template lang="pug" src="./index.pug"></template>

<script>
import { debounce, fadeUpIn } from '~/resources/mixins'
import BlockPagination from '~/components/block/block-post-pagination'
import BaseButtonCaret from '~/components/base/base-button-caret'
import BaseButtonSimple from '~/components/base/base-button-simple'
import BaseImage from '~/components/base/base-image'

export default {
  components: {
    BlockPagination,
    BaseButtonCaret,
    BaseButtonSimple,
    BaseImage
  },
  mixins: [debounce, fadeUpIn],
  props: {
    props: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      havePosts: false,
      navHeight: '0px',
      paginatedGallery: [],
      page: 0,
      perPage: 5,
      shownGallery: [],
      elemMinHeight: 0
    }
  },
  mounted () {
    if (this.$store.state.posts.posts) {
      this.havePosts = true
    }
    this.handleResize()
    window.addEventListener('resize', this.debounceFunc)

    this.$store.dispatch('VIEW_SITE', true)
    this.handleAnimation()
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.debounceFunc)
  },
  methods: {
    debounceFunc () {
      this.debounce(this.handleResize, null, 300)
    },
    handleResize () {
      this.getNavHeight()
      this.setMinHeight()
    },
    setMinHeight () {
      const footerHeight = document.querySelector('.footer').clientHeight
      const navHeight = document.querySelector('.navigation').clientHeight
      this.elemMinHeight = window.innerHeight - (footerHeight + navHeight)
    },
    getNavHeight () {
      this.$nextTick(() => {
        const navHeight = document.querySelector('.navigation').clientHeight
        this.navHeight = `${navHeight}px`
      })
    },
    handleAnimation () {
      this.$nextTick(() => {
        // const container = this.$refs.container
        if (this.props.header) {
          this.$_fadeUpIn(this.$refs.header, 24, 'top+=58')
        }
        if (this.posts && this.$store.state.posts.postsPerPage[this.$route.params.page]) {
          this.$refs.posts.forEach((post, i) => {
            this.$CustomEase.create('customEaseOut', '0.23, 1, 0.32, 1')
            const posttl = this.$gsap.timeline({
              scrollTrigger: {
                trigger: post,
                start: '-50 bottom'
              }
            })
            const delay = 0.1 + (0.3 * i)
            posttl.from(post, {
              opacity: 0,
              y: 24,
              delay,
              duration: 1,
              ease: 'customEaseOut'
            }, '<+=1')
          })
        }
      })
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

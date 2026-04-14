<template lang='pug' src="./index.pug"></template>

<script>

export default {
  props: {
    pages: {
      type: Array,
      default: () => ([])
    }
  },
  data: () => ({
    components: {},
    propsHeight: 0,
    list: [],
    listHeight: 0,
    expandedList: false,
    expandedProps: false,
    selectedElement: null,
    selectedSlugOrPath: null,
    sortedPages: [],
    type: null
  }),
  mounted () {
    this.sortPages()
    this.getComponents()
  },
  methods: {
    generateList () {
      if (this.type === 'page') {
        this.list = this.selectedElement.page_sections.slice().map(sec => sec.acf_fc_layout)
      } else {
        this.list = this.components[this.selectedSlugOrPath].locations.slice()
      }
    },
    getComponents () {
      const alphabetizeObjectKeys = (obj) => {
        const sortedKeys = Object.keys(obj).sort()
        const sortedObj = {}

        for (const key of sortedKeys) {
          sortedObj[key] = obj[key]
        }

        return sortedObj
      }
      const components = {}

      this.pages.forEach((page) => {
        const pageSections = page.page_sections
        if (pageSections) {
          pageSections.forEach((sec) => {
            if (!components[sec.acf_fc_layout]) {
              components[sec.acf_fc_layout] = {
                locations: [page.path]
              }
            } else if (components[sec.acf_fc_layout].locations) {
              components[sec.acf_fc_layout].locations.push(page.path)
            } else {
              console.log('>>>>>>>>>>>>>>>>>> ERROR in getComponents: components[sec.acf_fc_layout] = ', components[sec.acf_fc_layout])
            }
          })
        }
      })
      this.components = alphabetizeObjectKeys(components)
    },
    getHeights () {
      const theprops = this.$refs.theprops
      this.propsHeight = theprops ? theprops.clientHeight : 0
      const thelist = this.$refs.thelist
      this.listHeight = thelist ? thelist.clientHeight : 0
    },
    selectElement (type = 'component', compSlug) {
      this.expandedList = false
      this.expandedProps = false
      if (type === 'page') {
        this.type = 'page'
        this.selectedElement = this.pages.find(page => page.path === this.selectedSlugOrPath)
        this.generateList()
        this.expandedProps = false
        this.expandedList = true
      } else {
        this.type = 'component'
        if (compSlug) {
          this.selectedSlugOrPath = compSlug
          this.selectedElement = this.components[compSlug]
        } else {
          this.selectedElement = this.components[this.selectedSlugOrPath]
        }
        this.generateList()
        this.expandedProps = false
        this.expandedList = true
      }
      setTimeout(() => {
        this.getHeights()
      }, 300)
    },
    // sortPages will sort the pages as follows: [...alphabetizedTopLevelPages, ...alphabetizedChildPages]
    sortPages () {
      this.sortedPages = this.pages.slice()
        .sort((a, b) => a.title.localeCompare(b.title))
        .sort((a, b) => a.parent === 0 && b.parent !== 0 ? -1 : a.parent !== 0 && b.parent === 0 ? 1 : 0)
    },
    toggleProps () {
      this.expandedProps = !this.expandedProps
      this.expandedList = false
    },
    toggleList () {
      this.expandedList = !this.expandedList
      this.expandedProps = false
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

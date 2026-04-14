<template lang="pug" src="./index.pug" ></template>

<script>
import FormFlexible from '~/components/form/form-flexible'

export default {
  components: {
    FormFlexible
  },
  props: {
    props: {
      type: Object,
      default: () => ({})
    }
  },
  data: () => ({
    selectedForm: null
  }),
  mounted () {
    this.$nextTick(() => {
      this.selectedForm = this.$store.state.forms.find(form => form.id.toString() === this.props.form[0].toString())
    })
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

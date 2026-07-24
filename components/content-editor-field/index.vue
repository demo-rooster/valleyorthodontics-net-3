<template lang='pug' src='./index.pug'></template>

<script>
import ContentIconPicker from '~/components/content-icon-picker'
import ContentMediaPicker from '~/components/content-media-picker'
import { defaultArrayItem, describeObject, fieldDescriptor } from '~/resources/content-editor-schema'
import { mergeMediaAsset } from '~/resources/content-media'

export default {
  name: 'ContentEditorField',
  components: {
    ContentIconPicker,
    ContentMediaPicker
  },
  props: {
    descriptor: {
      type: Object,
      required: true
    },
    mediaCatalog: {
      type: Array,
      default: () => []
    },
    iconCatalog: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    childFields () {
      return describeObject(this.descriptor.value, this.descriptor.path)
    }
  },
  methods: {
    describeObject,
    arrayItemDescriptor (item, index) {
      if (item && typeof item === 'object') {
        return null
      }

      return fieldDescriptor(String(index), item, this.descriptor.path)
    },
    updateValue (value) {
      this.$emit('change', {
        path: this.descriptor.path,
        value,
        editKey: `field-${this.descriptor.path.join('.')}`
      })
    },
    updateInput (event) {
      const value = this.descriptor.type === 'number'
        ? Number(event.target.value)
        : event.target.value

      this.updateValue(value)
    },
    chooseAsset (selectedAsset) {
      this.updateValue(mergeMediaAsset(this.descriptor.value, selectedAsset))
    },
    emitArrayAction (action, index) {
      this.$emit('array-action', {
        action,
        path: this.descriptor.path,
        index,
        value: action === 'add'
          ? defaultArrayItem(this.descriptor.value, this.descriptor.key)
          : undefined
      })
    },
    forwardChange (payload) {
      this.$emit('change', payload)
    },
    forwardArrayAction (payload) {
      this.$emit('array-action', payload)
    }
  }
}
</script>

<style lang='sass' src='./index.sass'></style>

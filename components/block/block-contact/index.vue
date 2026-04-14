<template lang="pug" src="./index.pug" ></template>

<script>
// import { Loader } from '@googlemaps/js-api-loader'
import Icon from '~/assets/icons/map-pin.svg'
import BlockContactLocation from '~/components/block/block-contact/block-contact-location'

/* eslint-disable */
export default {
  components: {
    BlockContactLocation
  },
  props: {
    props: {
      type: Object,
      default: () => ({})
    },
    global: {
      type: Object,
      default: () => ({})
    }
  },
  data: () => ({
    mapLoading: true,
  }),
  computed: {
    location () {
      return this.global.location[0]
    },
    phoneAria () {
      if (this.global.phone.number) {
        return this.global.phone.number.replace(/-/g, '').split('').join(' ')
      } else {
        return null
      }
    }
  },
  mounted () {
    // const loadMap = new Loader ({
    //   apiKey: 'AIzaSyCSpsGcTMe2ET1jrOQsiNx0KoXFoj9mIy0'
    // })
    // loadMap.load().then(()=> {
    //   this.createMap()
    //   this.addMarker()
    //   this.mapLoading = false
    // })
  },
  methods: {
    createMap () {
      this.$map = new google.maps.Map(this.$refs.theMap, {
        center: {
          lat: Number(this.global.location[0].address.coordinates.latitude),
          lng: Number(this.global.location[0].address.coordinates.longitude)
        },
        zoom: 15,
        streetViewControl: false,
        fullscreenControl: false,
        mapId: '876c2d412dd92ae2'
      })
    },
    addMarker () {
      const $marker = new google.maps.Marker({
        position: {
          lat: Number(this.global.location[0].address.coordinates.longitude),
          lng: Number(this.global.location[0].address.coordinates.latitude)
        },
        map: this.$map,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(Icon),
          scaledSize: new google.maps.Size(32, 32)
        }
      })
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

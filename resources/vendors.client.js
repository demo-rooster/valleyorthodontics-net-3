import Vue from 'vue'
import VueWaypoint from 'vue-waypoint'
// import VueScrollTo from 'vue-scrollto'

const vendors = () => {
  Vue.use(VueWaypoint)
  // Vue.use(VueScrollTo, {
  //   container: 'body',
  //   duration: 1500,
  //   easing: 'ease',
  //   offset: 0,
  //   cancelable: true,
  //   onDone: false,
  //   onCancel: false,
  //   x: false,
  //   y: true
  // })
}

export default vendors()

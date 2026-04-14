export default function (to) {
  // the navigation class needs to be adjusted per project based on the nav placement and height
  const navOffset = document.querySelector('.navigation').offsetTop
  let topDistance = 0
  // the following fires off when navigating to a hash on the same page
  if (to.hash && document.querySelector(to.hash)) {
    let elem = document.querySelector(to.hash)
    // makes sure that the correct offsetTop is calculated

    while (elem) {
      topDistance += elem.offsetTop
      elem = elem.offsetParent
    }
    topDistance = topDistance < 0 ? 0 : topDistance
    // Calculate duration based on distance (1ms per 2px, minimum 500ms, maximum 2000ms)
    const duration = Math.min(Math.max(topDistance / 2, 500), 2000)
    return new Promise((resolve) => {
      window.scrollTo({
        top: topDistance - navOffset,
        behavior: 'smooth'
      })
      setTimeout(resolve, duration)
    })
  }
  // the following fires off when navigating to a different page
  return new Promise((resolve) => {
    this.app.$root.$once('triggerScroll', () => {
      // the following fires off when navigating to a hash on a different page
      if (to.hash && document.querySelector(to.hash)) {
        let elem = document.querySelector(to.hash)
        // makes sure that the correct offsetTop is calculated
        setTimeout(() => {
          while (elem) {
            topDistance += elem.offsetTop
            elem = elem.offsetParent
          }
          topDistance = topDistance < 0 ? 0 : topDistance
          // Calculate duration based on distance (1ms per 2px, minimum 500ms, maximum 2000ms)
          const duration = Math.min(Math.max(topDistance / 2, 500), 2000)
          // can increase or decrease scroll delay as needed
          setTimeout(() => {
            window.scrollTo({
              top: topDistance - navOffset,
              behavior: 'smooth'
            })
          }, duration)
        }, 500)
      }
      resolve({ y: 0 })
    })
  })
}

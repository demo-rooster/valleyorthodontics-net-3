export const trapFocus = {
  methods: {
    $_trapFocus (element) {
      const focusableEls = element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])')
      const firstFocusableEl = focusableEls[0]
      const lastFocusableEL = focusableEls[focusableEls.length - 1]

      element.style.outline = 'transparent'

      element.addEventListener('keydown', function (e) {
        const isTabPressed = (e.key === 'Tab' || e.keyCode === 9)

        if (!isTabPressed) {
          return
        }

        /* eslint-disable */
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableEl) {
              e.preventDefault()
            lastFocusableEL.focus()
          }
        } else {
          if (document.activeElement === lastFocusableEL) {
            e.preventDefault()
            firstFocusableEl.focus()
          }
        }
      })
      element.focus()
    }
  }
}

export const removeFocus = {
  methods: {
    $_removeFocus () {
      document.activeElement.blur()
    }
  }
}

export const fadeUpIn = {
  methods: {
    $_fadeUpIn (element, yStart, start = 'top+48') {
      if (!element) {
        return
      }

      this.$CustomEase.create('customEaseOut', '0.23, 1, 0.32, 1')

      const tween = {
        y: yStart,
        opacity: 0,
        duration: 1.2,
        ease: 'customEaseOut'
      }

      // If the element is already within the viewport at creation time (e.g. an
      // above-the-fold hero/title), play the reveal immediately. A ScrollTrigger
      // whose start is already scrolled past does not fire its "enter" until the
      // first scroll event, which would otherwise leave the element invisible
      // (opacity: 0) on initial page load until the user scrolls.
      const rect = element.getBoundingClientRect()
      const inView = rect.top < window.innerHeight && rect.bottom > 0

      if (inView) {
        this.$gsap.from(element, tween)
        return
      }

      const tl = this.$gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: `${start} bottom`
        }
      })

      tl.from(element, tween)
    }
  }
}

export const titleAnimation = {
  methods: {
    $_titleAnimation (element, cssVar = null) {

      this.$CustomEase.create('customEaseOut', '0.23, 1, 0.32, 1')
      const titleSplit = new this.$SplitText(element, { type: 'lines' })

      const tl = this.$gsap.timeline({
        scrollTrigger: {
          id: 'fadeUpIn',
          trigger: element,
          start: 'bottom bottom'
        }
      })

      tl.from(titleSplit.lines, {
        y: '48',
        opacity: 0,
        duration: 1,
        stagger: 0.115,
        ease: 'customEaseOut'
      })
      if (cssVar !== null) {
        tl.from(element, {
          [cssVar]: 0,
          duration: 1,
          ease: 'power3.out'
        }, '<+=0.25')
      }
    }
  }
}

export const bodyScroll = {
  methods: {
    $_stopBodyScroll () {
      document.body.style.top = `-${window.scrollY}px`
      document.body.style.position = 'fixed'
      document.body.style.overflowY = 'scroll'
      document.body.style.width = '100%'
    },
    $_resetBodyScroll () {
      const scrollPos = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      window.scrollTo(0, parseInt(scrollPos || '0') * -1)
    }
  }
}

export const debounce = {
  data: () => ({
    debounceLastTimeout: null
  }),
  methods: {
    debounce (func, args, wait, immediate) {
      const later = () => {
        this.debounceLastTimeout = null
        if (!immediate) {
          func(args)
        }
      }
      const callNow = immediate && !this.debounceLastTimeout
      clearTimeout(this.debounceLastTimeout)
      this.debounceLastTimeout = setTimeout(later, wait)
      if (callNow) {
        func(args)
      }
    }
  }
}

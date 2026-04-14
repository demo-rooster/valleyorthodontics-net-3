<template lang="pug">
  .matrix
    .matrix-wrapper(ref="wrapper")
      canvas(ref="canvas")
</template>

<script>
export default {
  data () {
    return {
      opacity: 0.2
    }
  },
  mounted () {
    this.matrixEffect()
  },
  methods: {
    matrixEffect () {
      const canvas = this.$refs.canvas
      const ctx = canvas.getContext('2d')
      canvas.height = window.innerHeight
      canvas.width = window.innerWidth

      const wrapper = this.$refs.wrapper
      wrapper.style.opacity = this.opacity

      ctx.font = '15px monospace'
      ctx.fillStyle = '#0f0'
      ctx.globalAlpha = 1

      const columns = canvas.width / 15
      const drops = []

      for (let i = 0; i < columns; i++) {
        drops[i] = 1
      }

      function draw () {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        for (let i = 0; i < drops.length; i++) {
          const text = String.fromCharCode(Math.random() * 128 + 128)
          const y = drops[i] * 15

          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
          gradient.addColorStop(0, 'rgba(0, 255, 0, 0.4)')
          gradient.addColorStop(1, 'rgba(0, 255, 0, 0.8)')

          ctx.fillStyle = gradient
          ctx.fillText(text, i * 15, y)

          if (y > canvas.height || Math.random() > 0.975) {
            drops[i] = 0
          }
          drops[i]++
        }
      }

      setInterval(draw, 33)
    }
  }
}
</script>

<style lang="sass" scoped>
.matrix
  @extend %absolute
  pointer-events: none
  overflow: hidden

.matrix-wrapper
  width: 100%
  height: 100%
</style>

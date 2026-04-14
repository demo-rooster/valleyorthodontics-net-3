<template lang="pug">
  .skip-link
    button.skip-link__button(@click='handleFocus' @keyup.enter='handleFocus' tabindex='0') Skip to main content
</template>

<script>
export default {
  methods: {
    handleFocus () {
      const target = document.querySelector('#main-content')
      target.focus()
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

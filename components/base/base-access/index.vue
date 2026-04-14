<template lang="pug">
.base-access(v-if="$route.path !== '/accessibility'")
  .base-access__container(tabindex='0')
    p(v-html='`${props.company_name} Accessibility Statement. ${props.company_name} is committed to facilitating the accessibility and usability of its website, ${props.domain}, for everyone. ${props.company_name} aims to comply with all applicable standards, including the World Wide Web Consortiums Web Content Accessibility Guidelines 2.0 up to Level AA (WCAG 2.0 AA). ${props.company_name} is proud of the efforts that we have completed and that are in-progress to ensure that our website is accessible to everyone. We highly recommend using the userway accessibility widget linked in the footer, but should you experience any difficulty in accessing any part of this website, please feel free to ${props.phone.aria ? "call us at " + props.phone.aria + " or" : ""} email us at ${props.email} and we will work with you to provide the information or service you seek through an alternate communication method that is accessible for you consistent with applicable law (for example, through telephone support).`')
  nuxt-link.base-access__link(to='/accessibility' aria-label='Links to Accessibility page')
    .base-access__pixel
</template>

<script>

export default {
  props: {
    props: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style lang="sass" src="./index.sass"></style>

import Vue from 'vue'
import BaseBackground from '~/components/base/base-background/base-background'
import BaseIcon from '~/components/base/base-icon/base-icon'
import BaseImage from '~/components/base/base-image'
import BaseLoader from '~/components/base/base-loader'
import BaseButtonSimple from '~/components/base/base-button-simple'
import BaseButtonCta from '~/components/base/base-button-cta'
import BaseTexture from '~/components/base/base-texture'
import BaseModal from '~/components/base/base-modal'

const components = () => {
  Vue.component('BaseBackground', BaseBackground)
  Vue.component('BaseIcon', BaseIcon)
  Vue.component('BaseImage', BaseImage)
  Vue.component('BaseLoader', BaseLoader)
  Vue.component('BaseButtonSimple', BaseButtonSimple)
  Vue.component('BaseButtonCta', BaseButtonCta)
  Vue.component('BaseTexture', BaseTexture)
  Vue.component('BaseModal', BaseModal)
}

export default components()

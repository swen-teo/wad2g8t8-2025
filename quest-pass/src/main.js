import { createApp } from 'vue'
import App from './App.vue'
import router from './route/routes.js' // make sure to import your router
import { createPinia } from 'pinia' // make sure to import pinia
import axios from 'axios'
// bootstrap (CSS + JS)
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
// project global styles 
import './style.css'

import { library } from '@fortawesome/fontawesome-svg-core'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { fas } from '@fortawesome/free-solid-svg-icons' // Solid icons (fas)
import { far } from '@fortawesome/free-regular-svg-icons' // Regular icons (far)
import { fab } from '@fortawesome/free-brands-svg-icons' // Brand icons (fab)

library.add(fas, far, fab)

const app = createApp(App)

app.use(createPinia())
app.use(router)

// make axios available globally as $axios
app.config.globalProperties.$axios = axios

app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')


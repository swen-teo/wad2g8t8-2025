import { createApp } from 'vue'
import App from './App.vue'
import router from './route/routes.js' // make sure to import your router
import { createPinia, setActivePinia } from 'pinia' // make sure to import pinia
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


import { auth } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';


import { useUserStore } from './store/user.js';

library.add(fas, far, fab)

const pinia = createPinia()

let appInstance = null; 
onAuthStateChanged(auth, async (userAuth) => {
  
  if (!appInstance) {
    appInstance = createApp(App)
    appInstance.use(pinia)
    appInstance.use(router)

    appInstance.config.globalProperties.$axios = axios

    appInstance.component('font-awesome-icon', FontAwesomeIcon)
    
    setActivePinia(pinia)

    appInstance.mount('#app')
  }

  
  const userStore = useUserStore()

  if (userAuth) {
    await userStore.fetchUserProfile(userAuth)
  } else {
    userStore.clearUser()
  }
})
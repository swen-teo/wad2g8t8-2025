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

// 🔥 NEW: bring in Firebase auth and listener
import { auth } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

// 🔥 NEW: bring in your user store so we can sync profile
import { useUserStore } from './store/user.js';

library.add(fas, far, fab)

// Create a Pinia instance but don't mount the app until we know auth state.
const pinia = createPinia()

let appInstance = null; // we'll mount once, after we know auth state
onAuthStateChanged(auth, async (userAuth) => {
  // 1. mount the Vue app the first time this runs
  if (!appInstance) {
    appInstance = createApp(App)
    appInstance.use(pinia)
    appInstance.use(router)

    // make axios available globally as $axios
    appInstance.config.globalProperties.$axios = axios

    appInstance.component('font-awesome-icon', FontAwesomeIcon)

    // set active pinia so we can call useUserStore() outside components
    setActivePinia(pinia)

    appInstance.mount('#app')
  }

  // 2. update the Pinia user store based on current auth user
  const userStore = useUserStore()

  if (userAuth) {
    // user is logged in -> load or create their profile in Firestore
    await userStore.fetchUserProfile(userAuth)
  } else {
    // user is logged out -> clear store
    userStore.clearUser()
  }
})
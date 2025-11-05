import { createApp } from 'vue';
import App from './App.vue';
import router from './route/routes.js';
import { createPinia, setActivePinia } from 'pinia';
import axios from 'axios';

// Bootstrap assets.
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Global project styles.
import './style.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

import { auth } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

import { useUserStore } from './store/user.js';
import { useNavigationStore, extractTransitionMessage } from './store/navigation.js';

// Register icon packs globally.
library.add(fas, far, fab);

const pinia = createPinia();
const navigationStore = useNavigationStore(pinia);

// Track navigation transitions.
router.beforeEach((to, from, next) => {
  if (from.name) {
    const message = extractTransitionMessage(to);
    navigationStore.startTransition(message);
  }
  next();
});

router.afterEach(() => {
  navigationStore.finishTransition();
});

router.onError(() => {
  navigationStore.finishTransition();
});

let appInstance = null;
onAuthStateChanged(auth, async (userAuth) => {
  if (!appInstance) {
    appInstance = createApp(App);
    appInstance.use(pinia);
    appInstance.use(router);

    appInstance.config.globalProperties.$axios = axios;

    appInstance.component('font-awesome-icon', FontAwesomeIcon);

    setActivePinia(pinia);

    appInstance.mount('#app');
  }

  const userStore = useUserStore();

  if (userAuth) {
    await userStore.fetchUserProfile(userAuth);
  } else {
    userStore.clearUser();
  }
});

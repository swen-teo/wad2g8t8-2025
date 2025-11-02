import { createWebHistory, createRouter } from "vue-router";
// we need to import auth here so our navigation guard can use it
import { auth } from '../firebase.js';
import { onAuthStateChanged } from "firebase/auth";
import SpotifyCallback from '@/components/SpotifyCallback.vue';

// import "page" components using the correct relative paths
// fix: you are right! your files are in src/components/
// we will now import from ../components/
import Home from '../components/Home.vue';
import Login from '../components/Login.vue';
import Profile from '../components/Profile.vue';
import EventDetails from '../components/EventDetails.vue';
import LandingPage from "../components/LandingPage.vue";
import Instructions from "../components/Instructions.vue";
import LoadingScreen from '../components/Loading.vue';

const routes = [
  {
    path: '/',
    name: 'LandingPage',
    component: LandingPage,
  },

  {
    path: '/loading',
    name: 'Loading',
    component: LoadingScreen,
  },
  {
    path: '/instructions',
    name: 'Instructions',
    component: Instructions,
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }, // protect the main app area
  },
  {
    path: '/login', // The login page
    name: 'Login',
    component: Login,
  },
  {
    path: '/profile', // The user profile page
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }, // we can add this to protect pages
  },
  {
    path: '/event/:id', // A dynamic route for event details
    name: 'EventDetails',
    component: EventDetails,
    meta: { requiresAuth: true }, // protect this page too
    // allow the route param `id` to be passed as a prop to the component
    props: true,
  },
  {
  path: '/spotify-callback',
  name: 'SpotifyCallback',
  component: SpotifyCallback,
},
// catch-all LAST:
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(),
  routes, // short for `routes: routes`

  scrollBehavior(to, from, savedPosition) {
    // If a savedPosition exists (e.g., using the browser's back button), use it.
    if (savedPosition) {
      return savedPosition;
    }
    // Otherwise, always scroll to the top of the page.
    return { top: 0, left: 0 };
  },
});

let cachedUser = null;
let authReady = false;

onAuthStateChanged(auth, (user) => {
  cachedUser = user;
  authReady = true;
});



// this is a "navigation guard"
// it runs before every single page change
router.beforeEach((to, from, next) => {
  //   // we check if the page we're 'to'-ing requires auth
  //   const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    
  //   // and we check firebase to see if a user is currently logged in
  //   const user = auth.currentUser;

  //   if (requiresAuth && !user) {
  //     // if the page needs login and they aren't, send to login
  //     next('/login');
  //   } else {
  //     // otherwise, let them go
  //     next();
  //   }
  // });
    const needsAuth = to.matched.some((record) => record.meta.requiresAuth);

  // this function decides where to go once we know auth state
  function proceed() {
    // 1. if user is logged in and tries to go to /login, send them to /home
    if (to.path === "/login" && cachedUser) {
      next("/home");
      return;
    }

    // 2. if the route needs auth and there's no logged-in user, send to /login
    if (needsAuth && !cachedUser) {
      next("/login");
      return;
    }

    // 3. otherwise, allow navigation
    next();
  }

  // if we don't know auth state yet (first load), wait for it once
  if (!authReady) {
    const stop = onAuthStateChanged(auth, (user) => {
      cachedUser = user;
      authReady = true;
      stop();
      proceed();
    });
  } else {
    proceed();
  }
});

export default router;


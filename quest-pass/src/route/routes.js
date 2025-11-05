import { createWebHistory, createRouter } from "vue-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase.js";
import SpotifyCallback from "@/components/SpotifyCallback.vue";

import Home from "../components/Home.vue";
import Login from "../components/Login.vue";
import Profile from "../components/Profile.vue";
import EventDetails from "../components/EventDetails.vue";
import LandingPage from "../components/LandingPage.vue";
import MiniGames from "../components/MiniGames.vue";
import Instructions from "../components/Instructions.vue";
import LoadingScreen from "../components/Loading.vue";
import Tiers from "../components/Tiers.vue";
import Merch from "../components/Merch.vue";
import SilverMerch from "../components/SilverMerch.vue";

const routes = [
  {
    path: '/',
    name: 'LandingPage',
    component: LandingPage,
    meta: {
      transitionMessage: {
        title: 'Welcoming you to QuestPass…',
        subtitle: 'Tuning the spotlight for your arrival',
      },
    },
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
    // Only show to guests (not logged-in users).
    meta: {
      guestOnly: true,
      transitionMessage: {
        title: 'Opening the playbook…',
        subtitle: 'Highlighting how to start your quest',
      },
    },
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: true,
      transitionMessage: {
        title: 'Spinning up events…',
        subtitle: 'Cueing the next experience',
      },
    },
  },
  {
    // The login page.
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      transitionMessage: {
        title: 'Opening the gates…',
        subtitle: 'Signing you in for the show',
      },
    },
  },
  {
    // The user profile page.
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      requiresAuth: true,
      transitionMessage: {
        title: 'Opening your profile…',
        subtitle: 'Gathering your musical journey',
      },
    },
  },
  {
    path: '/minigames',
    name: 'MiniGames',
    component: MiniGames,
    meta: {
      requiresAuth: true,
      transitionMessage: {
        title: 'Booting mini games…',
        subtitle: 'Loading fresh challenges for you',
      },
    },
  },
  {
    path: '/tiers',
    name: 'Tiers',
    component: Tiers,
    meta: {
      requiresAuth: true,
      transitionMessage: {
        title: 'Checking membership tiers…',
        subtitle: 'Matching perks to your playlist',
      },
    },
  },

  {
    path: '/merch',
    name: 'Merch',
    component: Merch,
    meta: {
      requiresAuth: true,
      transitionMessage: {
        title: 'Loading the merch table…',
        subtitle: 'Folding the finest tour apparel',
      },
    },
  },
  
  {
    path: '/SilverMerch',
    name: 'SilverMerch',
    component: SilverMerch,
    meta: {
      requiresAuth: true,
      transitionMessage: {
        title: 'Curating the silver collection…',
        subtitle: 'Polishing limited-edition finds',
      },
    },
  },

  {
    // A dynamic route for event details.
    path: '/event/:id',
    name: 'EventDetails',
    component: EventDetails,
    meta: {
      requiresAuth: true,
      transitionMessage: {
        title: 'Loading event details…',
        subtitle: 'Sound-checking the lineup for you',
      },
    },
    // Allow the route param `id` to be passed as a prop to the component.
    props: true,
  },
  {
    path: '/spotify-callback',
    name: 'SpotifyCallback',
    component: SpotifyCallback,
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,

  scrollBehavior(to, from, savedPosition) {
    // If a savedPosition exists (e.g., using the browser's back button)
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

// Runs before every navigation change.
router.beforeEach((to, from, next) => {
  const needsAuth = to.matched.some((record) => record.meta.requiresAuth);

  // Decides where to go once the auth state is known.
  function proceed() {
    if (to.path === "/login" && cachedUser) {
      next("/home");
      return;
    }

    if (needsAuth && !cachedUser) {
      next({ path: "/login", query: { redirect: to.fullPath } });
      return;
    }

    const guestOnly = to.matched.some((record) => record.meta.guestOnly);
    if (guestOnly && cachedUser) {
      next("/home");
      return;
    }

    next();
  }

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


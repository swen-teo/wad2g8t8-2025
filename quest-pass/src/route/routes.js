import { createWebHistory, createRouter } from "vue-router";
// we need to import auth here so our navigation guard can use it
import { auth } from '../firebase.js';

// import "page" components using the correct relative paths
// fix: you are right! your files are in src/components/
// we will now import from ../components/
import Home from '../components/Home.vue';
import Login from '../components/Login.vue';
import Profile from '../components/Profile.vue';
import EventDetails from '../components/EventDetails.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
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
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes, // short for `routes: routes`
});

// this is a "navigation guard"
// it runs before every single page change
router.beforeEach((to, from, next) => {
  // we check if the page we're 'to'-ing requires auth
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  // and we check firebase to see if a user is currently logged in
  const user = auth.currentUser;

  if (requiresAuth && !user) {
    // if the page needs login and they aren't, send to login
    next('/login');
  } else {
    // otherwise, let them go
    next();
  }
});

export default router;


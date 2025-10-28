import { createWebHistory, createRouter } from "vue-router";

// Import your new components
import Home from '../components/Home.vue';
import Login from '../components/Login.vue';
import Profile from '../components/Profile.vue';
import EventDetails from '../components/EventDetails.vue';

const history = createWebHistory();
const routes = [
  {
    path: '/', // main page
    component: Home
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/profile',
    component: Profile
  },
  {
    path: '/event/:id', // path takes a parameter of the event id
    component: EventDetails
  },
];

const router = createRouter({
    history,
    routes,
});

export default router;
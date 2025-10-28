<template>
  <div>
    <Navbar />


    <RouterView />

    <div
      class="toast-container position-fixed bottom-0 end-0 p-3"
      style="z-index: 1100"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast show"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div class="toast-header">
          <strong
            class="me-auto"
            :class="`text-${toast.type || 'primary'}`"
            >{{ toast.title }}</strong
          >
          <button
            type="button"
            class="btn-close"
            @click="removeToast(toast.id)"
            aria-label="Close"
          ></button>
        </div>
        <div class="toast-body">{{ toast.message }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase.js'; // our firebase config
import { useUserStore } from '@/store/user.js'; // our pinia store
import { useRouter } from 'vue-router';
import Navbar from '@/components/Navbar.vue'; // our navbar component

// a simple, local state for toasts.
// can move this into a store later if needed.
const toasts = ref([]);
let toastId = 0;

function addToast({ title, message, type = 'primary' }) {
  const id = toastId++;
  toasts.value.push({ id, title, message, type });
  // auto-remove after 5 seconds
  setTimeout(() => removeToast(id), 5000);
}

function removeToast(id) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

// provide this function to all child components
// so any component can show a toast.
import { provide } from 'vue';
provide('addToast', addToast);

// --- firebase auth listener ---
const userStore = useUserStore();
const router = useRouter();

// onmounted runs once when the app component is first created.
onMounted(() => {
  // this firebase function listens for any change in login state
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // a user is logged in!
      // fetch their profile data
      // from the firestore database using their uid.
      await userStore.fetchUserProfile(user.uid);
    } else {
      // user is logged in.
      // clear any old data from our store.
      userStore.clearUser();
    }
  });

  // router guard to protect routes
  router.beforeEach((to, from) => {
    // check if the route we're going to needs auth
    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
      // not logged in. send to the login page.
      // store where they *wanted* to go,
      // send them back there after login.
      return {
        path: '/login',
        query: { redirect: to.fullPath },
      };
    }
    return true;
  });
});
</script>

<style>
body {
  background-color: #f8f9fa; /* a light gray background */
}
</style>

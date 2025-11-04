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
  // Auth listener centralized in main.js and routing guard centralized in routes.js
  // Keeping App.vue lean to avoid duplicate guards that may conflict with navigation.
});
</script>

<style>
body {
  background-color: #f8f9fa; /* a light gray background */
}
</style>

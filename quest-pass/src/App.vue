<template>
  <div>
    <SparkleBackground />
    <Loading
      :is-loading="navigationStore.isTransitioning"
      :title="navigationStore.title"
      :subtitle="navigationStore.subtitle"
    />
    <Navbar v-if="showNavbar" />


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
import { computed, provide, ref } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from '@/components/Navbar.vue';
import Loading from '@/components/Loading.vue';
import SparkleBackground from '@/components/SparkleBackground.vue';
import { useNavigationStore } from '@/store/navigation.js';

// Local toast notifications state.
const toasts = ref([]);
let toastId = 0;

function addToast({ title, message, type = 'primary' }) {
  const id = toastId++;
  toasts.value.push({ id, title, message, type });
  // Auto-remove after five seconds.
  setTimeout(() => removeToast(id), 5000);
}

function removeToast(id) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

provide('addToast', addToast);
const route = useRoute();
const navigationStore = useNavigationStore();

const showNavbar = computed(() => route.name !== 'Login');
</script>


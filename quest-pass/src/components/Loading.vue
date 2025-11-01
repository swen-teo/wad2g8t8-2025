<template>
  <div :class="['loader-overlay', { 'hidden': !isLoading }]">
    <div class="loader-box">
      <div class="loader-logo">
        <i class="fa fa-music" aria-hidden="true"></i>
      </div>
      <div class="loader-text">Loading...</div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

// This component accepts one prop, 'isLoading'.
// By default, it's 'true' (visible).
// The parent component will be responsible for setting it to 'false'
// when the page content has loaded.
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: true
  }
});
</script>

<style>
/* NOTE: These styles are NOT scoped.
  This is intentional, as a fullscreen overlay needs to
  control the entire viewport.
*/

/* ----------------------------
    Fullscreen loading overlay
    ---------------------------- */
.loader-overlay {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: linear-gradient(180deg, #ffffff, #f7f3ff);
    z-index: 9999; /* above everything */
    transition: opacity .45s ease, visibility .45s ease;
    opacity: 1;
    visibility: visible;
}
.loader-overlay.hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
}
.loader-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}
.loader-logo {
    width: 84px;
    height: 84px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: radial-gradient(90px 90px at 30% 20%, #ffffff99 0%, transparent 40%), linear-gradient(135deg, #fde7f7 0%, #f1e7ff 100%);
    box-shadow: 0 12px 32px rgba(130,120,255,.12);
    animation: loader-spin 1.6s linear infinite;
}
.loader-logo i { color: #8a7df9; font-size: 34px; }
.loader-text { font-family: 'Poppins', sans-serif; color: #6f6b86; font-weight: 600; }

@keyframes loader-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>
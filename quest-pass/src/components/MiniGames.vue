<template>
  <div class="container py-5">
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h1 class="fw-bold mb-0">Mini Games</h1>
      <span class="text-muted">Heardle-style guessing game</span>
    </div>

    <div class="row g-4">
      <div class="col-12 col-lg-10 mx-auto d-flex">
        <HeardleGame class="w-100" />
      </div>
    </div>
  </div>
</template>

<script setup>
import HeardleGame from './HeardleGame.vue'
</script>

<style scoped>
/* Page-level tweaks if needed */
</style>
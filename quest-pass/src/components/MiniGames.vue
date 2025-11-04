<template>
  <div class="container py-5">
    <div class="d-flex align-items-center justify-content-between mb-3 mb-md-4">
      <h1 class="fw-bold mb-0">Mini Games</h1>
      <span class="text-muted d-none d-sm-inline">Pick a game and earn points</span>
    </div>

    <div class="row g-4 justify-content-center">
      <div class="col-12 col-md-10 col-lg-6">
        <HeardleGame />
      </div>
      <div class="col-12 col-md-10 col-lg-6">
        <CelebrityGuess />
      </div>
    </div>
  </div>
  
</template>

<script setup>
import HeardleGame from './HeardleGame.vue'
import CelebrityGuess from './CelebrityGuess.vue'
</script>

<style scoped>
/* Page-level tweaks if needed */
@media (min-width: 1200px) {
  /* Give grid a little extra breathing room on xl+ screens */
  .container { max-width: 1140px; }
}
</style>
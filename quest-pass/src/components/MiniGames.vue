<template>
  <div class="container py-5">
    <div class="d-flex align-items-center justify-content-between mb-3 mb-md-4">
      <h1 class="fw-bold mb-0">Mini Games</h1>
      <span class="text-muted d-none d-sm-inline">Pick a game and earn points</span>
    </div>

    <!-- Responsive grid: 1 col on mobile, 2 on md+, 3 on xl; stretch cards to equal heights -->
    <div class="row g-4 row-cols-1 row-cols-md-2 row-cols-xl-3 align-items-stretch justify-content-center">
      <div class="col d-flex">
        <HeardleGame class="h-100 flex-fill" />
      </div>
      <!-- Place Album Guesser before Artist Guesser -->
      <div class="col d-flex">
        <AlbumGuess class="h-100 flex-fill" />
      </div>
      <div class="col d-flex">
        <CelebrityGuess class="h-100 flex-fill" />
      </div>
    </div>
  </div>
  
</template>

<script setup>
import HeardleGame from './HeardleGame.vue'
import CelebrityGuess from './CelebrityGuess.vue'
import AlbumGuess from './AlbumGuess.vue'
</script>

<style scoped>
/* Page-level tweaks if needed */
@media (min-width: 1200px) {
  /* Give grid a little extra breathing room on xl+ screens */
  .container { max-width: 1140px; }
}
</style>
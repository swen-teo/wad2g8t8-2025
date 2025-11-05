<template>
  <div class="container py-5">
    <div class="d-flex align-items-center justify-content-between mb-3 mb-md-4">
  <h1 class="page-title mb-3">Mini Games</h1>
      <span class="text-muted d-none d-sm-inline">Pick a game and earn points</span>
    </div>

    <!-- Game chooser buttons: icons + short descriptions -->
  <div class="row row-cols-1 row-cols-sm-3 g-3 mb-3 align-items-stretch">
      <div class="col">
        <button
          type="button"
          class="btn btn-outline-primary w-100 h-100 text-start game-choice"
          :class="{ active: selectedGame==='heardle' }"
          :aria-pressed="selectedGame==='heardle'"
          @click="selectGame('heardle')"
        >
          <div class="d-flex align-items-center gap-3">
            <div class="icon-wrap">
              <font-awesome-icon :icon="['fas', 'music']" />
            </div>
            <div class="flex-grow-1">
              <div class="fw-semibold">Heardle</div>
              <small class="text-muted">Guess the track from short clips</small>
            </div>
          </div>
        </button>
      </div>
      <div class="col">
        <button
          type="button"
          class="btn btn-outline-primary w-100 h-100 text-start game-choice"
          :class="{ active: selectedGame==='album' }"
          :aria-pressed="selectedGame==='album'"
          @click="selectGame('album')"
        >
          <div class="d-flex align-items-center gap-3">
            <div class="icon-wrap">
              <font-awesome-icon :icon="['fas', 'compact-disc']" />
            </div>
            <div class="flex-grow-1">
              <div class="fw-semibold">Album Guess</div>
              <small class="text-muted">Match albums to artists</small>
            </div>
          </div>
        </button>
      </div>
      <div class="col">
        <button
          type="button"
          class="btn btn-outline-primary w-100 h-100 text-start game-choice"
          :class="{ active: selectedGame==='celebrity' }"
          :aria-pressed="selectedGame==='celebrity'"
          @click="selectGame('celebrity')"
        >
          <div class="d-flex align-items-center gap-3">
            <div class="icon-wrap">
              <font-awesome-icon :icon="['fas', 'user']" />
            </div>
            <div class="flex-grow-1">
              <div class="fw-semibold">Artist Guesser</div>
              <small class="text-muted">Identify the celebrity or artist</small>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Selected game panel: renders only when chosen -->
    <transition name="slide-fade">
      <div v-if="selectedGame" ref="gamePanelRef" class="card game-panel border-0 shadow-sm rounded-3 mb-4">
        <div class="card-header bg-white d-flex align-items-center justify-content-between py-3 px-3 px-sm-4 rounded-top-3">
          <div class="fw-semibold">{{ currentGameTitle }}</div>
          <button class="btn btn-sm btn-outline-secondary" @click="closeGame">
            Close
          </button>
        </div>
        <div class="card-body p-3 p-sm-4">
          <div class="row justify-content-center">
            <div class="col-12 col-md-11 col-lg-10 col-xl-8">
              <component :is="currentGameComponent" />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import HeardleGame from './HeardleGame.vue'
import CelebrityGuess from './CelebrityGuess.vue'
import AlbumGuess from './AlbumGuess.vue'

const selectedGame = ref(null) // 'heardle' | 'album' | 'celebrity' | null
const gamePanelRef = ref(null)

function selectGame(key) {
  selectedGame.value = key
  // After rendering the panel, make sure it's fully visible
  nextTick(() => {
    if (gamePanelRef.value && typeof gamePanelRef.value.scrollIntoView === 'function') {
      gamePanelRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}
function closeGame() {
  selectedGame.value = null
}

const currentGameComponent = computed(() => {
  switch (selectedGame.value) {
    case 'heardle':
      return HeardleGame
    case 'album':
      return AlbumGuess
    case 'celebrity':
      return CelebrityGuess
    default:
      return null
  }
})

const currentGameTitle = computed(() => {
  switch (selectedGame.value) {
    case 'heardle':
      return 'Heardle'
    case 'album':
      return 'Album Guess'
    case 'celebrity':
      return 'Artist Guesser'
    default:
      return ''
  }
})
</script>

<style scoped>
/* Page-level tweaks */
@media (min-width: 1200px) {
  /* Keep grid nicely sized on xl+ screens */
  .container { max-width: 1140px; }
}

/* Ensure the selected game panel doesn't clip inner content*/
.game-panel {
  overflow: visible !important;
  scroll-margin-top: 72px;
}
.game-panel .card-body { overflow: visible; }

.game-choice {
  padding: 1rem 1.1rem;
  border-radius: 0.75rem;
  border-width: 2px;
  border-color: var(--primary-1, #5b21b6);
  background: #ffffff;
  transition: transform .14s ease, box-shadow .14s ease, background .14s ease, color .14s ease;
  min-height: 84px;
}
.game-choice:hover {
  box-shadow: 0 0.75rem 1.25rem rgba(0,0,0,0.10);
  transform: translateY(-2px);
}
.game-choice:focus-visible {
  outline: 3px solid rgba(92, 53, 202, 0.35);
  outline-offset: 2px;
}
.game-choice.active,
.game-choice:hover,
.game-choice:active {
  color: #fff !important;
  background: linear-gradient(90deg, var(--primary-1, #5b21b6) 0%, var(--primary-2, #7c3aed) 100%);
  border-color: transparent !important;
}
.game-choice.active .text-muted,
.game-choice:hover .text-muted {
  color: rgba(255,255,255,0.9) !important;
}
.icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(91,33,182,0.10);
  color: var(--primary-1, #5b21b6);
  font-size: 1.35rem;
}
.game-choice.active .icon-wrap,
.game-choice:hover .icon-wrap {
  background: rgba(255,255,255,0.2);
  color: #fff;
}
.game-choice .fw-semibold { font-size: 1.05rem; }
.game-choice .fw-semibold {
  color: var(--bs-body-color, #212529);
}
.game-choice.active .fw-semibold,
.game-choice:hover .fw-semibold {
  color: #ffffff !important;
}

/* Reuse slide-fade from Home.vue if available */
.slide-fade-enter-active,
.slide-fade-leave-active { transition: all .2s ease; }
.slide-fade-enter-from,
.slide-fade-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
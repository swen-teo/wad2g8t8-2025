<template>
  <div class="card game-card shadow-sm w-100">
    <div class="card-body p-4">
      <div class="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <div class="game-icon">
            <font-awesome-icon :icon="['fas','image']" />
          </div>
          <h5 class="mb-0">Artist Guesser</h5>
        </div>
        <div v-if="!isLoading && !isComplete" class="d-flex align-items-center gap-2 flex-wrap header-badges">
          <span class="badge bg-light text-dark border">
            Attempt {{ attempts.length + 1 }} / {{ MAX_ATTEMPTS }}
          </span>
          <span v-if="!isComplete" class="badge bg-warning text-dark border">
            <font-awesome-icon :icon="['fas','trophy']" class="me-1" /> Worth {{ currentAttemptPoints }} pts
          </span>
          <div class="info-trigger">
            <button
              type="button"
              class="btn btn-light border btn-sm p-1 d-inline-flex align-items-center justify-content-center"
              aria-label="Scoring info"
              title="Scoring info"
              @click.stop="toggleInfo"
            >
              <font-awesome-icon :icon="['fas','info-circle']" />
            </button>
            <div
              v-if="showInfo"
              class="info-popover shadow-sm bg-light border rounded-3 p-3 small"
              @click.stop
            >
              <div class="fw-semibold mb-1">Scoring</div>
              <ul class="mb-2 ps-3">
                <li>1st try: 60 pts</li>
                <li>2nd try: 50 pts</li>
                <li>3rd try: 40 pts</li>
                <li>4th try: 30 pts</li>
                <li>5th try: 20 pts</li>
                <li>6th try: 10 pts</li>
              </ul>
              <div class="text-muted">Skips don't award points. Points add to your global total.</div>
            </div>
          </div>
        </div>
      </div>

      <p class="text-muted small mb-3">
        Guess the artist from the blurred image. Each attempt reveals a clearer picture.
      </p>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center p-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading artists...</span>
        </div>
        <p class="mt-2 text-muted">Loading today's artists from Deezer...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="alert alert-danger">
        <strong>Error:</strong> {{ errorMessage }}
        <p class="mb-0 small">Could not load artists. The Deezer API or proxy might be down. Please try reloading.</p>
      </div>
      
      <!-- Game UI (Main Content) -->
      <div v-else>
        <div class="row align-items-start g-3 g-md-4">
          <!-- Left: Image -->
          <div class="col-12 col-md-5 d-flex justify-content-center justify-content-md-start">
            <div class="image-container shadow-sm mb-3 mb-md-0">
              <img 
                v-if="answer"
                :src="answer.pictureUrl" 
                :alt="`Blurred image of ${answer.name}`"
                :style="{ filter: `blur(${effectiveBlur}px)` }"
                @error="onImageError"
              />
              <!-- Win overlay: subtle success chip -->
              <div v-if="isWin" class="image-overlay" aria-live="polite">
                <div class="overlay-chip success">
                  <font-awesome-icon :icon="['fas','check']" class="me-2" />
                  Correct!
                </div>
              </div>
              <!-- Loss overlay: show revealed answer on top of unblurred image -->
              <div v-if="isLoss" class="image-overlay" aria-live="polite">
                <div class="overlay-chip">
                  <font-awesome-icon :icon="['fas','eye']" class="me-2" />
                  Answer: <strong class="ms-1">{{ answer.name }}</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Controls + Input + Attempts -->
          <div class="col-12 col-md-7">
            <!-- Controls -->
            <div class="d-flex flex-wrap gap-2 align-items-center mb-3 controls">
              <button class="btn btn-outline-secondary" :disabled="isComplete" @click="skipAttempt">
                <font-awesome-icon :icon="['fas','forward']" class="me-2" />Skip
              </button>
              <button
                class="btn ms-auto"
                :class="isRegenerating ? 'btn-outline-secondary' : 'btn-outline-danger'"
                @click="resetGame"
                :disabled="isRegenerating"
              >
                <template v-if="isRegenerating">Regenerated!</template>
                <template v-else>
                  <font-awesome-icon :icon="['fas','sync']" class="me-2" />
                  Get a new artist
                </template>
              </button>
            </div>

            <!-- Guess input with suggestions -->
            <div class="guess-box mb-3">
              <input 
                type="text" 
                class="form-control"
                placeholder="Guess the artist..."
                v-model="query"
                :disabled="isComplete"
                @focus="showSuggestions = true"
                @blur="hideSuggestions"
                @keydown.down.prevent="onArrowDown"
                @keydown.up.prevent="onArrowUp"
                @keydown.enter.prevent="onEnter"
                @keydown.esc.prevent="onEscape"
              >
              <ul 
                class="list-group suggestion-list shadow-sm"
                v-if="showSuggestions && suggestions.length > 0"
              >
                <li 
                  v-for="(artist, index) in suggestions" 
                  :key="artist.id"
                  class="list-group-item list-group-item-action"
                  :class="{ 'active': index === focusedIndex }"
                  @mousedown="selectSuggestion(artist)"
                  @mouseenter="focusedIndex = index"
                >
                  <strong>{{ artist.name }}</strong>
                </li>
              </ul>
            </div>

            <!-- Attempts list -->
            <div class="attempts-list">
              <div v-if="isLoss" class="alert alert-warning text-center">
                <strong>So close!</strong> The answer was <br><strong>{{ answer.name }}</strong>
              </div>
              <div 
                v-for="(guess, index) in reversedAttempts" 
                :key="index"
                class="alert"
                :class="guess.isCorrect ? 'alert-success' : 'alert-danger'"
              >
                <font-awesome-icon :icon="['fas', guess.isCorrect ? 'check' : 'times']" class="me-2" />
                {{ guess.name }}
              </div>
              <div v-if="isWin" class="alert alert-success text-center">
                <strong>Well done! You got it!</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/store/user'

// --- State ---

// Game State
const allArtists = ref([]) // Will be filled by API
const answer = ref(null)
const query = ref('')
const attempts = ref([])
const currentLevel = ref(0) // 0-5
const MAX_ATTEMPTS = 6
const blurLevels = [24, 16, 8, 4, 2, 0] // Blur radius in pixels

// UI State
const isLoading = ref(true)
const errorMessage = ref(null)
const showSuggestions = ref(false)
const focusedIndex = ref(-1)
const showInfo = ref(false)
// UI feedback on reset button
const isRegenerating = ref(false)
const regenBtnTimer = ref(null)

// Stores
const userStore = useUserStore()

// --- Computed Properties ---

const isComplete = computed(() => isWin.value || isLoss.value)
const isWin = computed(() => attempts.value.some(g => g.isCorrect))
const isLoss = computed(() => attempts.value.length >= MAX_ATTEMPTS && !isWin.value)

const suggestions = computed(() => {
  if (query.value.length < 2) return []
  const q = query.value.toLowerCase()
  return allArtists.value.filter(artist => {
    return artist.name.toLowerCase().includes(q) && 
           !attempts.value.some(a => a.id === artist.id)
  }).slice(0, 5) // Limit to 5 suggestions
})

// Blur control: unblur immediately on game completion (win or loss)
const effectiveBlur = computed(() => (isComplete.value ? 0 : blurLevels[currentLevel.value]))

// Points helpers (same as Heardle)
const currentAttemptNumber = computed(() => Math.min(attempts.value.length + 1, MAX_ATTEMPTS))
function pointsForAttempt(n) {
  return Math.max(10, 70 - n * 10)
}
const currentAttemptPoints = computed(() => (isComplete.value ? 0 : pointsForAttempt(currentAttemptNumber.value)))

function toggleInfo() {
  showInfo.value = !showInfo.value
}

function handleOutsideClick() {
  if (showInfo.value) showInfo.value = false
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  if (regenBtnTimer.value) clearTimeout(regenBtnTimer.value)
})

// Show newest attempts first
const reversedAttempts = computed(() => [...attempts.value].reverse())

// --- Game Logic ---

function makeGuess(artist) {
  if (isComplete.value) return

  const isCorrect = artist.id === answer.value.id
  attempts.value.push({ ...artist, isCorrect })
  
  // Award points if correct based on attempt number (1st=60, 2nd=50, ... 6th=10)
  if (isCorrect) {
    const attemptNumber = attempts.value.length // after push => 1..6
    const points = pointsForAttempt(attemptNumber)
    userStore.awardPoints(points).catch((e) => {
      console.error('Failed to award points:', e)
    })
  }
  
  query.value = ''
  showSuggestions.value = false

  if (!isCorrect && attempts.value.length < MAX_ATTEMPTS) {
    currentLevel.value++
  }
}

function skipAttempt() {
  if (isComplete.value) return

  attempts.value.push({ 
    id: `skip-${Date.now()}`, 
    name: 'Skipped', 
    isCorrect: false 
  })
  
  if (attempts.value.length < MAX_ATTEMPTS) {
    currentLevel.value++
  }
}

// --- Data Fetching ---

// Fetch multiple Deezer pages to increase artist pool
async function fetchDeezerPages(endpoint, limit = 100, maxPages = 3) {
  const results = []
  for (let page = 0; page < maxPages; page++) {
    const index = page * limit
    const url = `https://corsproxy.io/?https://api.deezer.com/${endpoint}?limit=${limit}&index=${index}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Request failed (${res.status}) for ${endpoint}`)
    const data = await res.json()
    const items = data?.data || []
    results.push(...items)
    if (items.length < limit) break // no more pages
  }
  return results
}

async function fetchArtistsFromCharts() {
  const raw = await fetchDeezerPages('chart/0/artists', 100, 3)
  const map = new Map()
  raw.forEach(a => {
    const picture = a.picture_big || a.picture_medium || a.picture
    if (picture && !map.has(a.id)) {
      map.set(a.id, { id: a.id, name: a.name, pictureUrl: picture })
    }
  })
  return Array.from(map.values())
}

async function fetchArtistsFromTracksFallback(limit = 100) {
  const url = `https://corsproxy.io/?https://api.deezer.com/chart/0/tracks?limit=${limit}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Tracks fallback failed (${res.status})`)
  const data = await res.json()
  const artistsMap = new Map()
  data.data.forEach(track => {
    if (track.artist && (track.artist.picture_big || track.artist.picture_medium)) {
      if (!artistsMap.has(track.artist.id)) {
        artistsMap.set(track.artist.id, {
          id: track.artist.id,
          name: track.artist.name,
          pictureUrl: track.artist.picture_big || track.artist.picture_medium
        })
      }
    }
  })
  return Array.from(artistsMap.values())
}

async function fetchAndSetGame() {
  isLoading.value = true
  errorMessage.value = null
  
  try {
    // Prefer the charts artists endpoint to gather more artists with pagination
    let fetchedArtists = await fetchArtistsFromCharts()
    // Fallback: derive from chart tracks if chart artists returned nothing
    if (fetchedArtists.length === 0) {
      fetchedArtists = await fetchArtistsFromTracksFallback(100)
    }

    if (fetchedArtists.length === 0) {
      throw new Error('No artists with pictures were found.')
    }

    allArtists.value = fetchedArtists
    answer.value = pickRandom(allArtists.value)
    
  } catch (err) {
    console.error("Failed to load artists:", err)
    errorMessage.value = err.message
  } finally {
    isLoading.value = false
  }
}

// Fetch songs when the component is first loaded
onMounted(fetchAndSetGame)

// --- Event Handlers & Utilities ---

function onImageError() {
  // If an image fails to load, pick a new artist
  errorMessage.value = "An artist image failed to load. Picking a new one..."
  resetGame()
}

function resetGame() {
  attempts.value = []
  currentLevel.value = 0
  query.value = ''
  showSuggestions.value = false
  focusedIndex.value = -1
  
  // Pick a new random artist from the *existing* list
  if (allArtists.value.length > 0) {
    answer.value = pickRandom(allArtists.value)
    if (regenBtnTimer.value) clearTimeout(regenBtnTimer.value)
    isRegenerating.value = true
    regenBtnTimer.value = setTimeout(() => {
      isRegenerating.value = false
      regenBtnTimer.value = null
    }, 1500)
  } else {
    // If list is empty (e.g., initial fetch failed), try fetching again
    fetchAndSetGame()
    if (regenBtnTimer.value) clearTimeout(regenBtnTimer.value)
    isRegenerating.value = true
    regenBtnTimer.value = setTimeout(() => {
      isRegenerating.value = false
      regenBtnTimer.value = null
    }, 1800)
  }
}

function selectSuggestion(artist) {
  query.value = artist.name
  showSuggestions.value = false
  makeGuess(artist)
}

function hideSuggestions() {
  // Use setTimeout to allow click event to register before blur
  setTimeout(() => {
    showSuggestions.value = false
    focusedIndex.value = -1
  }, 200)
}

function onArrowDown() {
  if (suggestions.value.length === 0) return
  focusedIndex.value = (focusedIndex.value + 1) % suggestions.value.length
}

function onArrowUp() {
  if (suggestions.value.length === 0) return
  focusedIndex.value = (focusedIndex.value - 1 + suggestions.value.length) % suggestions.value.length
}

function onEnter() {
  if (focusedIndex.value >= 0 && suggestions.value[focusedIndex.value]) {
    selectSuggestion(suggestions.value[focusedIndex.value])
  } else if (query.value.length > 0) {
    const q = query.value.toLowerCase()
    const directMatch = allArtists.value.find(s => s.name.toLowerCase() === q)
    if(directMatch) {
      makeGuess(directMatch)
    }
  }
  focusedIndex.value = -1
}

function onEscape() {
  query.value = ''
  showSuggestions.value = false
  focusedIndex.value = -1
}

function pickRandom(list) { 
  return list[Math.floor(Math.random() * list.length)] 
}
</script>

<style scoped>
.game-card {
  border: 1px solid rgba(0,0,0,0.04);
  border-radius: 1rem;
  background: linear-gradient(180deg, #ffffff 0%, #fbfaff 100%);
  width: 100%;
  max-width: 100%; /* allow parent column to control width */
  overflow: visible; /* allow popovers/lists to extend beyond */
  display: flex;
  height: 100%;
}
.game-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: inline-grid; place-items: center; color: #fff;
  background: linear-gradient(135deg, var(--primary-1), var(--primary-2));
  box-shadow: 0 6px 14px rgba(96,75,200,0.18);
}
.image-container {
  /* Smaller, responsive square so the input stays visible */
  width: clamp(200px, 60vw, 300px); /* centered */
  aspect-ratio: 1 / 1;
  border-radius: 0.75rem;
  overflow: hidden;
  background-color: #eee;
  margin-left: auto;
  margin-right: auto;
  position: relative; /* allow overlay positioning */
}
.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.5s ease-out; /* Smooth transition for the blur */
}
.image-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.25) 40%, transparent 70%);
  color: #fff;
  padding: 0.75rem;
}
.overlay-chip {
  background: rgba(0,0,0,0.45);
  border: 1px solid rgba(255,255,255,0.18);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-weight: 600;
  box-shadow: 0 6px 14px rgba(0,0,0,0.2);
}
.guess-box { 
  position: relative; 
}
.suggestion-list {
  position: absolute; 
  left: 0; 
  right: 0; 
  top: 100%; 
  z-index: 1080; /* above card */
  border: 1px solid #f1eefb; 
  border-top: none; 
  border-radius: 0 0 .75rem .75rem;
  max-height: min(260px, 40vh);
  overflow-y: auto;
}
.list-group-item-action {
  cursor: pointer;
}

/* ensure inner body doesn't clip overflow either */
.game-card :deep(.card-body) {
  overflow: visible;
  display: flex;
  flex-direction: column;
}

/* popover styles shared with Heardle */
.info-trigger { position: relative; }
.info-popover {
  position: absolute;
  right: 0;
  top: 120%;
  width: 260px;
  max-width: min(90vw, 280px);
  z-index: 1080;
}

/* Responsive tweaks */
/* Removed fixed max-width so cards fill their grid columns at all breakpoints */

@media (max-width: 575.98px) {
  /* tighten paddings slightly on very small screens */
  .game-card :deep(.card-body) {
    padding: 1rem !important;
  }
  .game-icon {
    width: 32px;
    height: 32px;
  }
  /* stack controls vertically and make buttons full width for easy tapping */
  .controls .btn {
    flex: 1 1 100%;
    width: 100%;
  }
  .info-popover { right: 0; left: auto; }
}

/* Header badges wrapping on narrow cards */
.header-badges { row-gap: .5rem; }
.header-badges .badge { white-space: nowrap; }
.header-badges .info-trigger { flex: 0 0 auto; }

/* Center and constrain card + scale image on larger screens */
@media (min-width: 768px) {
  .game-card { max-width: 720px; margin-left: auto; margin-right: auto; }
  /* Keep image moderate on tablets */
  .image-container { width: clamp(240px, 40vw, 360px); }
}
@media (min-width: 992px) {
  .game-card { max-width: 840px; }
  /* And on desktops */
  .image-container { width: clamp(280px, 36vw, 400px); }
}
</style>

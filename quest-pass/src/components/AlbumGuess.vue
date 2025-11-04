<template>
  <div class="card game-card shadow-sm w-100">
    <div class="card-body p-4">
      <div class="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <div class="game-icon">
            <font-awesome-icon :icon="['fas','compact-disc']" />
          </div>
          <h5 class="mb-0">Album Guesser</h5>
        </div>
        <div v-if="!isLoading && !isComplete" class="d-flex align-items-center gap-2 flex-wrap">
          <span class="badge bg-light text-dark border">
            Attempt {{ attempts.length + 1 }} / {{ MAX_ATTEMPTS }}
          </span>
          <span class="badge bg-warning text-dark border">
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
        Pick an artist, then guess the album from the blurred cover. Each attempt reveals a clearer image.
      </p>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center p-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading artists...</span>
        </div>
        <p class="mt-2 text-muted">Loading popular artists...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="alert alert-danger">
        <strong>Error:</strong> {{ errorMessage }}
        <p class="mb-0 small">Please try reloading or picking another artist.</p>
      </div>

      <!-- Artist Picker -->
      <div v-else-if="!selectedArtist">
        <div class="guess-box mb-3">
          <input 
            type="text" 
            class="form-control"
            placeholder="Search artist to play..."
            v-model="artistQuery"
            @focus="showArtistSuggestions = true"
            @blur="hideArtistSuggestions"
            @keydown.down.prevent="onArtistArrowDown"
            @keydown.up.prevent="onArtistArrowUp"
            @keydown.enter.prevent="onArtistEnter"
            @keydown.esc.prevent="onArtistEscape"
          >
          <ul 
            class="list-group suggestion-list shadow-sm"
            v-if="showArtistSuggestions && artistSuggestions.length > 0"
          >
            <li 
              v-for="(artist, index) in artistSuggestions" 
              :key="artist.id"
              class="list-group-item list-group-item-action d-flex align-items-center gap-2"
              :class="{ 'active': index === artistFocusedIndex }"
              @mousedown="selectArtist(artist)"
              @mouseenter="artistFocusedIndex = index"
            >
              <img :src="artist.pictureUrl" alt="" width="28" height="28" class="rounded-circle" style="object-fit: cover;"/>
              <strong>{{ artist.name }}</strong>
            </li>
          </ul>
        </div>
        <div class="text-muted small">Tip: Start typing to filter from popular artists.</div>
      </div>

      <!-- Game UI (Main Content) -->
      <div v-else>
        <!-- Album Cover -->
        <div class="image-container shadow-sm mb-3">
          <img 
            v-if="answer"
            :src="answer.coverUrl" 
            :alt="`Blurred cover of ${answer.title}`"
            :style="{ filter: `blur(${effectiveBlur}px)` }"
          />
          <div v-if="isWin" class="image-overlay" aria-live="polite">
            <div class="overlay-chip success">
              <font-awesome-icon :icon="['fas','check']" class="me-2" />
              Correct!
            </div>
          </div>
          <div v-if="isLoss" class="image-overlay" aria-live="polite">
            <div class="overlay-chip">
              <font-awesome-icon :icon="['fas','eye']" class="me-2" />
              Answer: <strong class="ms-1">{{ answer.title }}</strong>
            </div>
          </div>
        </div>

        <!-- Controls -->
        <div class="d-flex flex-wrap gap-2 align-items-center mb-3 controls">
          <button class="btn btn-outline-secondary" :disabled="isComplete" @click="skipAttempt">
            <font-awesome-icon :icon="['fas','forward']" class="me-2" />Skip
          </button>
          <button class="btn btn-secondary" @click="changeArtist">
            <font-awesome-icon :icon="['fas','user']" class="me-2" />Change artist
          </button>
          <button class="btn btn-outline-danger ms-auto" @click="resetGameWithinArtist" :disabled="!selectedArtist">
            <font-awesome-icon :icon="['fas','sync']" />
          </button>
        </div>

        <!-- Guess input with suggestions -->
        <div class="guess-box mb-3">
          <input 
            type="text" 
            class="form-control"
            placeholder="Guess the album..."
            v-model="query"
            :disabled="isComplete || !selectedArtist"
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
              v-for="(album, index) in suggestions" 
              :key="album.id"
              class="list-group-item list-group-item-action"
              :class="{ 'active': index === focusedIndex }"
              @mousedown="selectSuggestion(album)"
              @mouseenter="focusedIndex = index"
            >
              <strong>{{ album.title }}</strong>
            </li>
          </ul>
        </div>

        <!-- Attempts list -->
        <div class="attempts-list">
          <div v-if="isLoss" class="alert alert-warning text-center">
            <strong>So close!</strong> The answer was <br><strong>{{ answer.title }}</strong>
          </div>
          <div 
            v-for="(guess, index) in reversedAttempts" 
            :key="index"
            class="alert"
            :class="guess.isCorrect ? 'alert-success' : 'alert-danger'"
          >
            <font-awesome-icon :icon="['fas', guess.isCorrect ? 'check' : 'times']" class="me-2" />
            {{ guess.title }}
          </div>
          <div v-if="isWin" class="alert alert-success text-center">
            <strong>Well done! You got it!</strong>
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
const userStore = useUserStore()

// Shared constants
const MAX_ATTEMPTS = 6
const blurLevels = [24, 16, 8, 4, 2, 0]

// Artists
const allArtists = ref([])
const artistQuery = ref('')
const showArtistSuggestions = ref(false)
const artistFocusedIndex = ref(-1)

// Albums
const selectedArtist = ref(null)
const albums = ref([])
const answer = ref(null)

// Game state
const query = ref('')
const attempts = ref([])
const currentLevel = ref(0)

// UI State
const isLoading = ref(true)
const errorMessage = ref(null)
const showSuggestions = ref(false)
const focusedIndex = ref(-1)
const showInfo = ref(false)

// Completion state
const isWin = computed(() => attempts.value.some(g => g.isCorrect))
const isLoss = computed(() => attempts.value.length >= MAX_ATTEMPTS && !isWin.value)
const isComplete = computed(() => isWin.value || isLoss.value)
const reversedAttempts = computed(() => [...attempts.value].reverse())
const effectiveBlur = computed(() => (isComplete.value ? 0 : blurLevels[currentLevel.value]))

// Points (same as Heardle/Celebrity)
const currentAttemptNumber = computed(() => Math.min(attempts.value.length + 1, MAX_ATTEMPTS))
function pointsForAttempt(n) { return Math.max(10, 70 - n * 10) }
const currentAttemptPoints = computed(() => (isComplete.value ? 0 : pointsForAttempt(currentAttemptNumber.value)))

function toggleInfo() { showInfo.value = !showInfo.value }
function handleOutsideClick() { if (showInfo.value) showInfo.value = false }

onMounted(() => { document.addEventListener('click', handleOutsideClick) })
onUnmounted(() => { document.removeEventListener('click', handleOutsideClick) })

// Suggestions
const artistSuggestions = computed(() => {
  const q = artistQuery.value.trim().toLowerCase()
  if (!q) return allArtists.value.slice(0, 8)
  return allArtists.value.filter(a => a.name.toLowerCase().includes(q)).slice(0, 8)
})

const suggestions = computed(() => {
  if (!selectedArtist.value) return []
  const q = query.value.trim().toLowerCase()
  if (q.length < 2) return []
  return albums.value.filter(al => al.title.toLowerCase().includes(q) && !attempts.value.some(a => a.id === al.id)).slice(0, 5)
})

// Game logic
function makeGuess(album) {
  if (isComplete.value || !selectedArtist.value) return
  const isCorrect = album.id === answer.value.id
  attempts.value.push({ ...album, isCorrect })

  if (isCorrect) {
    const attemptNumber = attempts.value.length
    const points = pointsForAttempt(attemptNumber)
    userStore.awardPoints(points).catch((e) => console.error('Failed to award points:', e))
  }

  query.value = ''
  showSuggestions.value = false

  if (!isCorrect && attempts.value.length < MAX_ATTEMPTS) {
    currentLevel.value++
  }
}

function skipAttempt() {
  if (isComplete.value || !selectedArtist.value) return
  attempts.value.push({ id: `skip-${Date.now()}`, title: 'Skipped', isCorrect: false })
  if (attempts.value.length < MAX_ATTEMPTS) currentLevel.value++
}

function changeArtist() {
  resetAll()
}

function resetGameWithinArtist() {
  attempts.value = []
  currentLevel.value = 0
  query.value = ''
  focusedIndex.value = -1
  showSuggestions.value = false
  // pick a new album within this artist
  if (albums.value.length > 0) {
    answer.value = pickRandom(albums.value)
  }
}

function resetAll() {
  selectedArtist.value = null
  albums.value = []
  answer.value = null
  artistQuery.value = ''
  attempts.value = []
  currentLevel.value = 0
  query.value = ''
  focusedIndex.value = -1
  showSuggestions.value = false
}

function selectSuggestion(album) {
  query.value = album.title
  showSuggestions.value = false
  makeGuess(album)
}

function hideSuggestions() { setTimeout(() => { showSuggestions.value = false; focusedIndex.value = -1 }, 200) }
function onArrowDown() { if (suggestions.value.length) focusedIndex.value = (focusedIndex.value + 1) % suggestions.value.length }
function onArrowUp() { if (suggestions.value.length) focusedIndex.value = (focusedIndex.value - 1 + suggestions.value.length) % suggestions.value.length }
function onEnter() {
  if (focusedIndex.value >= 0 && suggestions.value[focusedIndex.value]) {
    selectSuggestion(suggestions.value[focusedIndex.value])
  } else if (query.value.length > 0) {
    const q = query.value.toLowerCase()
    const directMatch = albums.value.find(s => s.title.toLowerCase() === q)
    if (directMatch) makeGuess(directMatch)
  }
  focusedIndex.value = -1
}
function onEscape() { query.value = ''; showSuggestions.value = false; focusedIndex.value = -1 }

function selectArtist(artist) {
  selectedArtist.value = artist
  showArtistSuggestions.value = false
  artistQuery.value = artist.name
  // load albums for artist
  fetchAlbumsForArtist(artist.id)
}
function hideArtistSuggestions() { setTimeout(() => { showArtistSuggestions.value = false; artistFocusedIndex.value = -1 }, 200) }
function onArtistArrowDown() { if (artistSuggestions.value.length) artistFocusedIndex.value = (artistFocusedIndex.value + 1) % artistSuggestions.value.length }
function onArtistArrowUp() { if (artistSuggestions.value.length) artistFocusedIndex.value = (artistFocusedIndex.value - 1 + artistSuggestions.value.length) % artistSuggestions.value.length }
function onArtistEnter() {
  if (artistFocusedIndex.value >= 0 && artistSuggestions.value[artistFocusedIndex.value]) {
    selectArtist(artistSuggestions.value[artistFocusedIndex.value])
  }
}
function onArtistEscape() { artistQuery.value = ''; showArtistSuggestions.value = false; artistFocusedIndex.value = -1 }

// Data fetching
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
    if (items.length < limit) break
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
  const map = new Map()
  data.data.forEach(track => {
    if (track.artist && (track.artist.picture_big || track.artist.picture_medium)) {
      if (!map.has(track.artist.id)) {
        map.set(track.artist.id, { id: track.artist.id, name: track.artist.name, pictureUrl: track.artist.picture_big || track.artist.picture_medium })
      }
    }
  })
  return Array.from(map.values())
}

async function fetchArtists() {
  isLoading.value = true
  errorMessage.value = null
  try {
    let artists = await fetchArtistsFromCharts()
    if (artists.length === 0) {
      artists = await fetchArtistsFromTracksFallback(100)
    }
    if (artists.length === 0) {
      throw new Error('No artists with pictures found.')
    }
    allArtists.value = artists
  } catch (e) {
    console.error('Failed to fetch artists', e)
    errorMessage.value = e.message
  } finally {
    isLoading.value = false
  }
}

async function fetchAlbumsForArtist(artistId) {
  isLoading.value = true
  errorMessage.value = null
  attempts.value = []
  currentLevel.value = 0
  query.value = ''
  try {
    const url = `https://corsproxy.io/?https://api.deezer.com/artist/${artistId}/albums?limit=100`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Albums request failed (${res.status})`)
    const data = await res.json()
    const fetched = (data.data || [])
      .filter(al => al.cover_big)
      .map(al => ({ id: al.id, title: al.title, coverUrl: al.cover_big }))
    if (fetched.length === 0) {
      errorMessage.value = 'No albums with covers found for this artist. Please choose another artist.'
      return
    }
    albums.value = fetched
    answer.value = pickRandom(albums.value)
  } catch (e) {
    console.error('Failed to fetch albums', e)
    errorMessage.value = e.message
  } finally {
    isLoading.value = false
  }
}

function pickRandom(list) { return list[Math.floor(Math.random() * list.length)] }

// Init
onMounted(fetchArtists)
</script>

<style scoped>
.game-card {
  border: 1px solid rgba(0,0,0,0.04);
  border-radius: 1rem;
  background: linear-gradient(180deg, #ffffff 0%, #fbfaff 100%);
  width: 100%;
  max-width: 100%;
  overflow: visible;
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
  width: min(100%, 360px);
  aspect-ratio: 1 / 1;
  border-radius: 0.75rem;
  overflow: hidden;
  background-color: #eee;
  margin-left: auto;
  margin-right: auto;
  position: relative;
}
.image-container img { width: 100%; height: 100%; object-fit: cover; transition: filter 0.5s ease-out; }
.image-overlay {
  position: absolute; inset: 0; display: flex; align-items: flex-end; justify-content: center;
  background: linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.25) 40%, transparent 70%);
  color: #fff; padding: 0.75rem;
}
.overlay-chip {
  background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.18);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  border-radius: 999px; padding: 0.35rem 0.75rem; font-weight: 600; box-shadow: 0 6px 14px rgba(0,0,0,0.2);
}
.overlay-chip.success { background: rgba(16,185,129,0.75); border-color: rgba(16,185,129,0.9); }

.guess-box { position: relative; }
.suggestion-list {
  position: absolute; left: 0; right: 0; top: 100%; z-index: 1080;
  border: 1px solid #f1eefb; border-top: none; border-radius: 0 0 .75rem .75rem;
  max-height: min(260px, 40vh); overflow-y: auto;
}
.list-group-item-action { cursor: pointer; }

.game-card :deep(.card-body) { overflow: visible; display: flex; flex-direction: column; }
.info-trigger { position: relative; }
.info-popover { position: absolute; right: 0; top: 120%; width: 260px; max-width: min(90vw, 280px); z-index: 1080; }

/* Removed fixed max-width so cards fill their grid columns at all breakpoints */
@media (max-width: 575.98px) {
  .game-card :deep(.card-body) { padding: 1rem !important; }
  .game-icon { width: 32px; height: 32px; }
  .controls .btn { flex: 1 1 100%; width: 100%; }
  .info-popover { right: 0; left: auto; }
}
</style>

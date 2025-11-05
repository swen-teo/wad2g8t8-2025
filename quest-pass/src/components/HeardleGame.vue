<template>
  <div class="card game-card shadow-sm w-100">
    <div class="card-body p-4">
  <div class="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <div class="game-icon"><font-awesome-icon :icon="['fas','music']" /></div>
          <h5 class="mb-0">Heardle</h5>
        </div>
        <div v-if="!isLoading" class="d-flex align-items-center gap-2 flex-wrap header-badges">
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
              <div class="fw-semibold mb-1">Heardle scoring</div>
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
        Listen to a short clip and guess the song. Each attempt reveals a longer snippet.
      </p>
      

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center p-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading songs...</span>
        </div>
        <p class="mt-2 text-muted">Loading today's tracks from Deezer...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="alert alert-danger">
        <strong>Error:</strong> {{ errorMessage }}
        <p class="mb-0 small">Could not load songs. The Deezer API or proxy might be down. Please try reloading.</p>
      </div>
      
      <!-- Game UI (Main Content) -->
      <div v-else>
        <!-- Controls -->
        <div class="d-flex flex-wrap gap-2 align-items-center mb-3 controls">
          <button class="btn btn-primary" :disabled="isComplete" @click="playSnippet">
            <font-awesome-icon :icon="['fas','play']" class="me-2" />Play snippet ({{ snippetDurations[currentLevel] }}s)
          </button>
          <button class="btn btn-outline-secondary" :disabled="isComplete" @click="skipAttempt">
            Skip
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
              Get a new song
            </template>
          </button>
        </div>

        <!-- Guess input with suggestions -->
        <div class="guess-box mb-3">
          <input 
            type="text" 
            class="form-control"
            placeholder="Guess the song..."
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
              v-for="(song, index) in suggestions" 
              :key="song.id"
              class="list-group-item list-group-item-action"
              :class="{ 'active': index === focusedIndex }"
              @mousedown="selectSuggestion(song)"
              @mouseenter="focusedIndex = index"
            >
              <strong>{{ song.title }}</strong> - <span class="text-muted">{{ song.artist }}</span>
            </li>
          </ul>
        </div>

        <!-- Attempts list -->
        <div class="attempts-list">
          <div 
            v-for="(guess, index) in attempts" 
            :key="index"
            class="alert"
            :class="guess.isCorrect ? 'alert-success' : 'alert-danger'"
          >
            <font-awesome-icon :icon="['fas', guess.isCorrect ? 'check' : 'times']" class="me-2" />
            {{ guess.title }} - {{ guess.artist }}
          </div>
          <div v-if="isWin" class="alert alert-success text-center">
            <strong>Well done! You got it!</strong>
          </div>
          <div v-if="isLoss" class="alert alert-warning text-center">
            <strong>So close!</strong> The answer was <br><strong>{{ answer.title }} - {{ answer.artist }}</strong>
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
const allSongs = ref([])
const answer = ref(null)
const query = ref('')
const attempts = ref([])
const currentLevel = ref(0) 
const MAX_ATTEMPTS = 6
const snippetDurations = [1, 2, 4, 8, 16, 30]
const sessionStartedAt = ref(new Date())
const sessionFinalized = ref(false)

// UI State
const isLoading = ref(true)
const errorMessage = ref(null)
const showSuggestions = ref(false)
const focusedIndex = ref(-1)
const showInfo = ref(false)
// UI feedback on reset button
const isRegenerating = ref(false)
const regenBtnTimer = ref(null)

// Audio State
const audioCtx = ref(null)
const currentAudioSource = ref(null) // This will hold the AudioBufferSourceNode

// Stores
const userStore = useUserStore()

// --- Computed Properties ---
const isComplete = computed(() => isWin.value || isLoss.value)
const isWin = computed(() => attempts.value.some(g => g.isCorrect))
const isLoss = computed(() => attempts.value.length >= MAX_ATTEMPTS && !isWin.value)

const suggestions = computed(() => {
  if (query.value.length < 2) return []
  const q = query.value.toLowerCase()
  return allSongs.value.filter(song => {
    const fullText = `${song.title} ${song.artist}`.toLowerCase()
    return fullText.includes(q) && !attempts.value.some(a => a.id === song.id)
  }).slice(0, 5) // Limit to 5 suggestions
})

// Points helpers
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
  if (!sessionFinalized.value && attempts.value.length > 0) {
    finalizeMiniGameSession({ outcome: 'abandoned', pointsEarned: 0 })
  }
  if (regenBtnTimer.value) {
    clearTimeout(regenBtnTimer.value)
  }
})

// --- Audio Logic ---
// Ensures the AudioContext is created (must be after user interaction)
async function ensureAudio() {
  if (audioCtx.value) return
  try {
    audioCtx.value = new (window.AudioContext || window.webkitAudioContext)()
    await audioCtx.value.resume()
  } catch (e) {
    console.error("Failed to create AudioContext:", e)
    errorMessage.value = "Could not initialize audio. Please interact with the page and try again."
  }
}

// Stops any currently playing audio snippet
function stopAudio() {
  if (currentAudioSource.value) {
    try {
      currentAudioSource.value.stop()
    } catch (e) {
      // Ignore errors if source already stopped
    }
    currentAudioSource.value = null
  }
}

// Plays an MP3 snippet from a URL for a specific duration.
async function playAudioSnippet(url, duration) {
  stopAudio()
  await ensureAudio()
  if (!audioCtx.value) return

  try {
    // 1. Fetch the MP3 file
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()

    // 2. Decode the MP3 data into an AudioBuffer
    const audioBuffer = await audioCtx.value.decodeAudioData(arrayBuffer)

    // 3. Create a source node to play the buffer
    const source = audioCtx.value.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioCtx.value.destination)
    
    // 4. Play only the specified duration
    // source.start(when, offset, duration)
    source.start(0, 0, duration) 

    // 5. Keep track of the source so we can stop it
    currentAudioSource.value = source
    
    // 6. Set a timeout to clear the ref after the snippet finishes
    setTimeout(() => {
      if (currentAudioSource.value === source) {
        currentAudioSource.value = null
      }
    }, duration * 1000)

  } catch (err) {
    console.error("Error playing audio snippet:", err)
    errorMessage.value = "Failed to play audio snippet."
  }
}

// This function is called by the "Play" button
function playSnippet() {
  if (!answer.value) return
  const duration = snippetDurations[currentLevel.value]
  playAudioSnippet(answer.value.previewUrl, duration)
}

// --- Game Logic ---
function beginSession() {
  sessionStartedAt.value = new Date()
  sessionFinalized.value = false
}

function formatAttemptsForSession() {
  return attempts.value.map((guess) => ({
    id: guess?.id ?? null,
    title: guess?.title ?? null,
    artist: guess?.artist ?? null,
    isCorrect: guess?.isCorrect === true,
  }))
}

function finalizeMiniGameSession({ outcome, pointsEarned }) {
  if (sessionFinalized.value) return
  sessionFinalized.value = true

  userStore
    .recordMiniGameResult('heardle', {
      pointsEarned,
      outcome,
      attemptCount: attempts.value.length,
      attempts: formatAttemptsForSession(),
      answer: answer.value
        ? {
            id: answer.value.id,
            title: answer.value.title,
            artist: answer.value.artist,
          }
        : null,
      sessionStartedAt: sessionStartedAt.value,
      completedAt: new Date(),
    })
    .catch((error) => {
      console.error('Failed to record Heardle session:', error)
    })
}

function makeGuess(song) {
  if (isComplete.value) return

  const isCorrect = song.id === answer.value.id
  attempts.value.push({ ...song, isCorrect })

  if (isCorrect) {
    const attemptNumber = attempts.value.length
    const points = pointsForAttempt(attemptNumber)
    userStore.awardPoints(points).catch((e) => {
      console.error('Failed to award points:', e)
    })
    finalizeMiniGameSession({ outcome: 'win', pointsEarned: points })
  }

  query.value = ''
  showSuggestions.value = false

  if (!isCorrect && attempts.value.length < MAX_ATTEMPTS) {
    currentLevel.value++
  }

  if (!isCorrect && isLoss.value) {
    finalizeMiniGameSession({ outcome: 'loss', pointsEarned: 0 })
  }

  stopAudio()
}

function skipAttempt() {
  if (isComplete.value) return

  attempts.value.push({ 
    id: `skip-${Date.now()}`, 
    title: 'Skipped', 
    artist: '', 
    isCorrect: false 
  })
  
  if (attempts.value.length < MAX_ATTEMPTS) {
    currentLevel.value++
  }

  if (isLoss.value) {
    finalizeMiniGameSession({ outcome: 'loss', pointsEarned: 0 })
  }

  stopAudio()
}

// --- Data Fetching ---
async function fetchAndSetGame() {
  isLoading.value = true
  errorMessage.value = null
  
  // We use a CORS proxy because api.deezer.com blocks browser requests
  const apiUrl = "https://corsproxy.io/?https://api.deezer.com/chart/0/tracks?limit=50"

  try {
    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error(`API request failed with status ${res.status}`)
    
    const data = await res.json()

    // Map the API response and *filter out* songs without a preview URL
    const fetchedSongs = data.data
      .filter(track => track.preview)
      .map(track => ({
        id: track.id,
        title: track.title,
        artist: track.artist.name,
        previewUrl: track.preview
      }))

    if (fetchedSongs.length === 0) {
      throw new Error("No songs with playable previews were found.")
    }

    allSongs.value = fetchedSongs
    answer.value = pickRandom(allSongs.value)
    beginSession()

  } catch (err) {
    console.error("Failed to load songs:", err)
    errorMessage.value = err.message
  } finally {
    isLoading.value = false
  }
}

// Fetch songs when the component is first loaded
onMounted(fetchAndSetGame)

// --- Event Handlers & Utilities ---
function resetGame() {
  stopAudio()
  if (!sessionFinalized.value && attempts.value.length > 0 && !isComplete.value) {
    finalizeMiniGameSession({ outcome: 'abandoned', pointsEarned: 0 })
  }
  attempts.value = []
  currentLevel.value = 0
  query.value = ''
  showSuggestions.value = false
  focusedIndex.value = -1
  
  // Pick a new random song from the *existing* list
  if (allSongs.value.length > 0) {
    answer.value = pickRandom(allSongs.value)
    beginSession()
    if (regenBtnTimer.value) clearTimeout(regenBtnTimer.value)
    isRegenerating.value = true
    regenBtnTimer.value = setTimeout(() => {
      isRegenerating.value = false
      regenBtnTimer.value = null
    }, 1500)
  } else {
    // If list is empty, try fetching again
    fetchAndSetGame()
    if (regenBtnTimer.value) clearTimeout(regenBtnTimer.value)
    isRegenerating.value = true
    regenBtnTimer.value = setTimeout(() => {
      isRegenerating.value = false
      regenBtnTimer.value = null
    }, 1800)
  }
}

function selectSuggestion(song) {
  query.value = `${song.title} - ${song.artist}`
  showSuggestions.value = false
  makeGuess(song)
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
    const directMatch = allSongs.value.find(s => 
      `${s.title} - ${s.artist}`.toLowerCase() === q
    )
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
:root {
  --primary-1: #6a11cb;
  --primary-2: #2575fc;
}
.game-card {
  border: 1px solid rgba(0,0,0,0.04);
  border-radius: 1rem;
  background: linear-gradient(180deg, #ffffff 0%, #fbfaff 100%);
  width: 100%;
  max-width: 100%;
  overflow: visible; 
  display: flex;
  height: 100%;
  position: relative;
}
.game-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: inline-grid; place-items: center; color: #fff;
  background: linear-gradient(135deg, var(--primary-1), var(--primary-2));
  box-shadow: 0 6px 14px rgba(96,75,200,0.18);
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

.info-trigger {
  position: relative;
}
.info-popover {
  position: absolute;
  right: 0;
  top: 120%;
  width: 260px;
  max-width: min(90vw, 280px);
  z-index: 1080;
}

.game-card :deep(.card-body) {
  overflow: visible;
  display: flex;
  flex-direction: column;
}

@media (max-width: 575.98px) {
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
  /* ensure the info popover is not cut off on tiny screens */
  .info-popover {
    right: 0;
    left: auto;
  }
}

/* Header badges wrapping on narrow cards */
.header-badges { row-gap: .5rem; }
.header-badges .badge { white-space: nowrap; }
.header-badges .info-trigger { flex: 0 0 auto; }

/* Responsive container sizing for larger screens */
@media (min-width: 768px) {
  .game-card { max-width: 720px; margin-left: auto; margin-right: auto; }
}
@media (min-width: 992px) {
  .game-card { max-width: 840px; }
}
</style>
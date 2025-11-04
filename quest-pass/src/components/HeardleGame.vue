<template>
  <div class="card game-card shadow-sm w-100">
    <div class="card-body p-4">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <div class="d-flex align-items-center gap-2">
          <div class="game-icon"><font-awesome-icon :icon="['fas','music']" /></div>
          <h5 class="mb-0">Heardle (Lite)</h5>
        </div>
        <span class="badge bg-light text-dark border">Attempt {{ attempts.length + 1 }} / {{ MAX_ATTEMPTS }}</span>
      </div>

      <p class="text-muted small mb-3">
        Listen to a short clip and guess the song. Each attempt reveals a longer snippet.
      </p>

      <!-- Controls -->
      <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
        <button class="btn btn-primary" :disabled="isComplete" @click="playSnippet">
          <font-awesome-icon :icon="['fas','play']" class="me-2" />Play snippet ({{ snippetDurations[currentLevel] }}s)
        </button>
        <button class="btn btn-outline-secondary" :disabled="isComplete" @click="skipAttempt">
          Skip
        </button>
        <button class="btn btn-outline-danger ms-auto" @click="resetGame">
          Reset
        </button>
      </div>

      <!-- Guess input with suggestions -->
      <div class="guess-box mb-3">
        <div class="input-group">
          <span class="input-group-text bg-white"><font-awesome-icon :icon="['fas','search']" /></span>
          <input
            type="text"
            class="form-control"
            v-model.trim="query"
            :disabled="isComplete"
            placeholder="Type song title or artist"
            @keydown.down.prevent="moveFocus(1)"
            @keydown.up.prevent="moveFocus(-1)"
            @keydown.enter.prevent="submitGuessFocused"
          />
          <button class="btn btn-success" :disabled="isComplete || !canSubmit" @click="submitGuess">
            Submit
          </button>
        </div>

        <ul v-if="showSuggestions" class="list-group suggestion-list">
          <li
            v-for="(s, idx) in suggestions"
            :key="s.id"
            class="list-group-item d-flex align-items-center justify-content-between"
            :class="{ focused: idx === focusedIndex }"
            role="button"
            tabindex="0"
            @mouseenter="focusedIndex = idx"
            @click="chooseSuggestion(s)"
          >
            <div class="d-flex align-items-center gap-2">
              <div class="suggestion-dot"></div>
              <div>
                <div class="fw-semibold">{{ s.title }}</div>
                <div class="text-muted small">{{ s.artist }}</div>
              </div>
            </div>
            <font-awesome-icon :icon="['fas','check']" class="text-success" v-if="selectedSuggestion && selectedSuggestion.id === s.id" />
          </li>
        </ul>
      </div>

      <!-- Attempts -->
      <div class="attempts mb-3">
        <div
          v-for="(att, i) in MAX_ATTEMPTS"
          :key="i"
          class="attempt-row"
        >
          <div v-if="attempts[i]" class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <div class="attempt-badge" :class="attempts[i].correct ? 'bg-success' : 'bg-light border'">
                {{ i + 1 }}
              </div>
              <div>
                <div class="fw-semibold">{{ attempts[i].label }}</div>
                <div class="small text-muted" v-if="!attempts[i].correct">Not correct</div>
              </div>
            </div>
            <font-awesome-icon :icon="['fas', attempts[i].correct ? 'check' : 'times']" :class="attempts[i].correct ? 'text-success' : 'text-muted'" />
          </div>
          <div v-else class="attempt-empty text-muted">Attempt {{ i + 1 }}</div>
        </div>
      </div>

      <!-- Result -->
      <div v-if="isComplete" class="alert" :class="didWin ? 'alert-success' : 'alert-secondary'">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <div class="fw-bold mb-1">{{ didWin ? 'Correct!' : 'Out of tries' }}</div>
            <div class="text-muted">Answer: <span class="fw-semibold">{{ answerLabel }}</span></div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary" @click="playFull">Play full</button>
            <button class="btn btn-primary" @click="resetGame">Play again</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

// Simple local dataset (placeholder titles/artists) with tone patterns instead of copyrighted audio
const SONGS = [
  { id: 's1', title: 'Neon Skyline', artist: 'Aurora City', pattern: [440, 494, 523, 587, 523, 494] },
  { id: 's2', title: 'Midnight Drive', artist: 'The Astrolites', pattern: [392, 440, 392, 330, 392, 440, 392] },
  { id: 's3', title: 'Ocean Echoes', artist: 'Blue Harbor', pattern: [349, 392, 440, 392, 349, 330] },
  { id: 's4', title: 'Golden Hour', artist: 'Sunset Stereo', pattern: [262, 330, 392, 440, 392, 330] },
  { id: 's5', title: 'Starlight', artist: 'Nova & Co', pattern: [523, 494, 440, 392, 440, 494] },
  { id: 's6', title: 'City Lights', artist: 'Metrowave', pattern: [330, 349, 392, 330, 294, 330] },
]

const MAX_ATTEMPTS = 6
const snippetDurations = [1, 2, 4, 7, 11, 16] // seconds

// Game state
const answer = ref(pickRandom(SONGS))
const attempts = ref([]) // { id, label, correct }
const currentLevel = ref(0)
const query = ref('')
const selectedSuggestion = ref(null)
const focusedIndex = ref(-1)

// Audio context
let audioCtx = null
let currentOsc = null
let stopTimer = null

function ensureAudio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    audioCtx = new Ctx()
  }
}

function playToneSequence(freqs, seconds) {
  ensureAudio()
  stopAudio()
  const now = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  gain.gain.value = 0.1 // gentle volume
  osc.type = 'sine'
  osc.connect(gain).connect(audioCtx.destination)

  // Schedule simple step sequence looping within allotted seconds
  const step = 0.35 // seconds per note
  let t = now
  let i = 0
  const endAt = now + seconds
  while (t < endAt) {
    const freq = freqs[i % freqs.length]
    osc.frequency.setValueAtTime(freq, t)
    t += step
    i++
  }
  osc.start(now)
  osc.stop(endAt)
  currentOsc = osc
  stopTimer = setTimeout(stopAudio, (seconds + 0.05) * 1000)
}

function stopAudio() {
  if (stopTimer) { clearTimeout(stopTimer); stopTimer = null }
  try { currentOsc && currentOsc.stop(); } catch (_) {}
  currentOsc = null
}

function playSnippet() {
  const seconds = snippetDurations[currentLevel.value]
  playToneSequence(answer.value.pattern, seconds)
}

function playFull() {
  playToneSequence(answer.value.pattern, 20)
}

onBeforeUnmount(() => {
  stopAudio()
})

// Suggestions
const suggestions = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  return SONGS.filter(s =>
    s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
  ).slice(0, 8)
})

const showSuggestions = computed(() => suggestions.value.length > 0 && !selectedSuggestion.value && !isComplete.value)
const canSubmit = computed(() => Boolean(selectedSuggestion.value))
const isComplete = computed(() => attempts.value.length >= MAX_ATTEMPTS || attempts.value.some(a => a.correct))
const didWin = computed(() => attempts.value.some(a => a.correct))
const answerLabel = computed(() => `${answer.value.title} — ${answer.value.artist}`)

function chooseSuggestion(s) {
  selectedSuggestion.value = s
  query.value = `${s.title} — ${s.artist}`
}

function moveFocus(delta) {
  if (!suggestions.value.length) return
  focusedIndex.value = (focusedIndex.value + delta + suggestions.value.length) % suggestions.value.length
}

function submitGuessFocused() {
  if (focusedIndex.value >= 0 && suggestions.value[focusedIndex.value]) {
    chooseSuggestion(suggestions.value[focusedIndex.value])
  }
  submitGuess()
}

function submitGuess() {
  if (!selectedSuggestion.value || isComplete.value) return
  const s = selectedSuggestion.value
  const correct = s.id === answer.value.id
  attempts.value.push({ id: s.id, label: `${s.title} — ${s.artist}`, correct })
  selectedSuggestion.value = null
  focusedIndex.value = -1
  if (!correct) {
    currentLevel.value = Math.min(currentLevel.value + 1, snippetDurations.length - 1)
  }
}

function skipAttempt() {
  if (isComplete.value) return
  attempts.value.push({ id: null, label: 'Skipped', correct: false })
  currentLevel.value = Math.min(currentLevel.value + 1, snippetDurations.length - 1)
}

function resetGame() {
  stopAudio()
  answer.value = pickRandom(SONGS)
  attempts.value = []
  currentLevel.value = 0
  query.value = ''
  selectedSuggestion.value = null
  focusedIndex.value = -1
}

function pickRandom(list) { return list[Math.floor(Math.random() * list.length)] }
</script>

<style scoped>
.game-card {
  border: 1px solid rgba(0,0,0,0.04);
  border-radius: 1rem;
  background: linear-gradient(180deg, #ffffff 0%, #fbfaff 100%);
}
.game-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: inline-grid; place-items: center; color: #fff;
  background: linear-gradient(135deg, var(--primary-1), var(--primary-2));
  box-shadow: 0 6px 14px rgba(96,75,200,0.18);
}
.guess-box { position: relative; }
.suggestion-list {
  position: absolute; left: 0; right: 0; top: 100%; z-index: 10;
  border: 1px solid #f1eefb; border-top: none; border-radius: 0 0 .75rem .75rem;
  max-height: 260px; overflow: auto;
}
.suggestion-list .list-group-item { cursor: pointer; }
.suggestion-list .list-group-item.focused { background: rgba(167,139,250,0.08); }
.suggestion-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--primary-1); }

.attempts { border-top: 1px solid #f1eefb; padding-top: .75rem; }
.attempt-row { padding: .5rem 0; border-bottom: 1px solid #f8f6ff; }
.attempt-badge { color: #111; width: 28px; height: 28px; border-radius: 6px; display: grid; place-items: center; font-weight: 600; }
.attempt-empty { padding: .5rem 0; }
</style>
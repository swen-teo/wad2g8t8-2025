<!-- <template>
  <div class="quest-overlay" @click.self="closeQuest">
    <div class="card quest-card-modal quest-card-glass shadow-lg">
      <button class="btn-close-overlay btn-close-white" @click="closeQuest">&times;</button>

      <div class="card-body p-4 d-flex align-items-center text-white">
        <i class="fab fa-spotify fa-3x text-success me-4"></i>
        <div class="flex-grow-1">
          <h5 class="fw-bold">Music Discovery</h5>
          <p class="text-white-75 small mb-1">
            Listen to {{ artistName }} on Spotify to earn points.
          </p>
          <div class="text-primary-1 fw-bold">
            +{{ questData.points }} / {{ MUSIC_MAX }} Points
          </div>
        </div>
        <button
          class="btn btn-success"
          @click="startSpotifyQuest"
          :disabled="isMusicQuestDone || isLoading"
        >
          <i v-if="!isLoading" class="fas fa-play me-2"></i>
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
          {{ getButtonText() }}
        </button>
      </div>

      <div v-if="isLoading" class="p-4 p-md-5 text-center border-top border-light border-opacity-25">
        <div class="vinyl-player-container mb-4">
          <div class="vinyl-record" :class="{ spinning: isLoading }">
            <div class="vinyl-label"></div>
          </div>
          <div class="vinyl-arm"></div>
        </div>
        <h5 class="mt-3 mb-1 text-white">Connecting to Spotify...</h5>
        <p class="text-white-75 small">Please wait. You may be redirected.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles for the overlay */
.quest-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  /* MODIFICATION: Darker, more subtle background */
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050; /* Above bootstrap navbar */
  /* MODIFICATION: Increased blur on the page behind */
  backdrop-filter: blur(10px);
}

.quest-card-modal {
  position: relative;
  width: 90%;
  max-width: 600px;
  border: none;
  animation: fadeIn 0.3s ease-out;
}

/* * NEW: Glassmorphism Style
* This replaces the default white '.card' background
*/
.quest-card-glass {
  /* Dark, semi-transparent background */
  background: rgba(30, 30, 30, 0.75); 
  /* Blur the content behind the card */
  backdrop-filter: blur(15px);
  /* Subtle white border */
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.75rem; /* Match EventDetails style */
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}


@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.btn-close-overlay {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2rem;
  font-weight: 300;
  /* MODIFICATION: Changed color to be visible on dark bg */
  color: #ccc;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  z-index: 10;
  opacity: 0.8;
}
.btn-close-overlay:hover {
  color: #fff;
  opacity: 1;
}

/* * NEW: Vinyl Player Styles 
*/
.vinyl-player-container {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vinyl-record {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  /* Record texture */
  background: repeating-radial-gradient(
    circle at center,
    rgba(20, 20, 20, 0.5) 0,
    rgba(20, 20, 20, 0.5) 1px,
    #111 1px,
    #111 2px
  );
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Still state */
  transform: rotate(20deg);
  transition: transform 0.5s ease-out;
}

.vinyl-record.spinning {
  /* Spinning state */
  transform: rotate(0deg); /* Reset start point */
  animation: spin 3s linear infinite;
  transition: none; /* Disable transition when spinning */
}

.vinyl-label {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: #1ed760; /* Spotify Green */
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}
/* Spindle hole */
.vinyl-label::after {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #111;
  border: 1px solid #333;
}

.vinyl-arm {
  width: 40px;
  height: 120px;
  background: #ddd;
  border-radius: 5px;
  position: absolute;
  top: 20px;
  right: 20px;
  transform-origin: 20px 20px;
  transform: rotate(30deg);
  z-index: 10;
  border: 2px solid #ccc;
  /* Stylus head */
  box-shadow: -5px 5px 10px rgba(0, 0, 0, 0.3);
}
.vinyl-arm::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: -10px;
  width: 20px;
  height: 20px;
  background: #aaa;
  border-radius: 3px;
}
.vinyl-record.spinning + .vinyl-arm {
  /* Animate arm onto record */
  transform: rotate(55deg);
  transition: transform 0.5s ease-in-out;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

</style>

<script setup>
import { ref, computed, onMounted } from 'vue';
// Import the new service
import {
  redirectToSpotifyAuth,
  handleSpotifyRedirect,
} from '../services/spotify.js';

// --- configuration ---
const MUSIC_MAX = 300;

// --- component setup ---
const props = defineProps({
  artistName: {
    type: String,
    required: true,
  },
  questData: {
    type: Object,
    required: true,
  },
});

// Add 'close' to emits
const emit = defineEmits(['update-progress', 'close']);

// --- local state ---
const isLoading = ref(false); // To show loading state

// --- computed properties ---
const isMusicQuestDone = computed(() => props.questData.completed);

// --- lifecycle ---
onMounted(async () => {
  // Check if this is a spotify redirect
  // We check for the 'code' query parameter
  const params = new URLSearchParams(window.location.search);
  if (params.has('code')) {
    isLoading.value = true; // Show loading state inside the overlay
    try {
      // The service handles token exchange and validation
      const progress = await handleSpotifyRedirect(props.artistName);
      if (progress && progress.points > props.questData.points) {
        // Emit the new progress
        emit('update-progress', progress);
        // Note: The parent component will handle closing this overlay
      } else {
        // No progress made, or already completed
        emit('close');
      }
    } catch (e) {
      console.error('Spotify redirect handling failed:', e);
      // You could show an error toast here
      emit('close'); // Close on error
    } finally {
      isLoading.value = false;
    }
  }
});

// --- quest 1: spotify ---

async function startSpotifyQuest() {
  if (isMusicQuestDone.value) return;

  isLoading.value = true; // Show loading state
  try {
    // The service handles the entire redirect
    await redirectToSpotifyAuth();
  } catch (e) {
    console.error('Spotify login failed:', e);
    isLoading.value = false; // Hide loading state on fail
  }
}

// --- New functions ---

function closeQuest() {
  // Only allow close if not in the middle of redirect logic
  if (!isLoading.value) {
    emit('close');
  }
}

function getButtonText() {
  if (isLoading.value) return 'Connecting...';
  if (isMusicQuestDone.value) return 'Completed';
  return 'Start Quest';
}
</script> -->

<template>
  <div class="p-4">
    <h4 class="mb-2">Music Discovery</h4>
    <p class="text-muted">
      We’ll check your recently played tracks. If we find songs by
      <strong>{{ artistName }}</strong> played at least 5 times, you earn
      <strong>300 points</strong>.
    </p>

    <div class="mb-3">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-else-if="loading" class="alert alert-info">Checking Spotify…</div>
      <div v-else class="alert alert-light border">
        Plays detected for <strong>{{ artistName }}</strong>:
        <strong>{{ plays }}</strong> / 5
      </div>
    </div>

    <div class="d-flex gap-2">
      <button class="btn btn-primary" :disabled="loading" @click="checkSpotify">
        {{ loading ? 'Checking…' : 'Check Spotify Now' }}
      </button>
      <button class="btn btn-outline-secondary" @click="$emit('close')">
        Close
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// Props/Emits (compatible with your EventDetails.vue)
const props = defineProps({
  artistName: { type: String, required: true },
  questData:  { type: Object, required: true },
});
const emit = defineEmits(['update-progress', 'close']);

// --- Fast-fail settings ---
const TIMEOUT_MS = 7000; // abort Spotify check after 7s

const loading = ref(false);
const error   = ref('');
const plays   = ref(0);

function token() {
  return localStorage.getItem('spotify_access_token') || '';
}
function norm(s) { return (s || '').toString().trim().toLowerCase(); }

async function checkSpotify() {
  if (loading.value) return; 
  loading.value = true;
  error.value = '';
  plays.value = 0;

  const t = token();
  if (!t) {
    error.value = 'Not connected to Spotify. Tap “Start Quest” to connect.';
    loading.value = false;
    return;
  }

  try {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

    const res = await fetch(
      'https://api.spotify.com/v1/me/player/recently-played?limit=50',
      { headers: { Authorization: `Bearer ${t}` }, signal: ctrl.signal }
    );
    clearTimeout(timer);

    if (res.status === 401) throw new Error('Spotify login expired. Please try again.');
    if (!res.ok) throw new Error((await res.text()) || `Spotify error (${res.status})`);

    const data   = await res.json();
    const target = norm(props.artistName);

    let count = 0;
    for (const item of (data.items || [])) {
      const names = (item.track?.artists || []).map(a => norm(a.name));
      if (names.some(n => n.includes(target))) count++;
    }

    plays.value = count;

    if (count >= 5) {
      // Award full points and let EventDetails save & update UI
      emit('update-progress', { points: 300, completed: true });
    } else {
      error.value = `We didn’t find 5 recent plays by “${props.artistName}”. Try again later.`;
    }
  } catch (e) {
    error.value = (e?.name === 'AbortError')
      ? 'Spotify check timed out. Please try again.'
      : String(e?.message || e);
  } finally {
    loading.value = false;
  }
}

// Receive tokens from popup and immediately run a check
function onMessage(e) {
  if (e.origin !== window.location.origin) return;
  const msg = e.data || {};
  if (msg.type === 'spotify-auth-success') {
    if (msg.access_token)   localStorage.setItem('spotify_access_token', msg.access_token);
    if (msg.refresh_token)  localStorage.setItem('spotify_refresh_token', msg.refresh_token);
    checkSpotify();
  } else if (msg.type === 'spotify-auth-failed') {
    error.value = 'Spotify login failed. Please try again.';
  }
}

onMounted(() => {
  window.addEventListener('message', onMessage);
  // If already connected, auto-check
  if (token()) checkSpotify();
});
onUnmounted(() => window.removeEventListener('message', onMessage));
</script>

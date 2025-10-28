<template>
  <!-- Fullscreen Overlay Wrapper -->
  <div class="quest-overlay" @click.self="closeQuest">
    
    <!-- Quest Content Card -->
    <div class="card quest-card-modal shadow-lg">
      <!-- Close Button -->
      <button class="btn-close-overlay" @click="closeQuest">&times;</button>

      <!-- Original Card Content (quest 1: music) -->
      <div class="card-body p-4 d-flex align-items-center">
        <i class="fab fa-spotify fa-3x text-success me-4"></i>
        <div class="flex-grow-1">
          <h5 class="fw-bold">Music Discovery</h5>
          <p class="text-muted small mb-1">
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

      <!-- Loading/Connecting State -->
      <div v-if="isLoading" class="p-4 text-center border-top">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <h5 class="mt-3 mb-1">Connecting to Spotify...</h5>
        <p class="text-muted small">Please wait. You may be redirected.</p>
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
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050; /* Above bootstrap navbar */
  backdrop-filter: blur(5px);
}

.quest-card-modal {
  position: relative;
  width: 90%;
  max-width: 600px;
  border: none;
  border-radius: 0.5rem;
  animation: fadeIn 0.3s ease-out;
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
  color: #6c757d;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  z-index: 10;
}
.btn-close-overlay:hover {
  color: #000;
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
</script>


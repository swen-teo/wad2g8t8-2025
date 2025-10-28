<template>
  <!-- loading spinner -->
  <div
    v-if="isLoading"
    class="d-flex justify-content-center align-items-center vh-100"
  >
    <div
      class="spinner-border text-primary-1"
      role="status"
    >
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>

  <!-- error message -->
  <div
    v-else-if="error"
    class="container my-5 text-center"
  >
    <div
      class="alert alert-danger"
      role="alert"
    >
      <h4 class="alert-heading">Event Not Found</h4>
      <p>{{ error }}</p>
    </div>
  </div>

  <!-- main event content -->
  <div
    v-else-if="event"
    class="event-details-page"
  >
    <!-- header banner -->
    <header
      class="event-banner"
      :style="{ backgroundImage: `url(${event.bannerImage})` }"
    >
      <div class="container p-5">
        <h1 class="display-4 fw-bold text-white mb-3">
          {{ event.title }}
        </h1>
        <h4 class="text-white-75">{{ event.date }}</h4>
      </div>
    </header>

    <main class="container my-5">
      <div class="row g-4">
        <!-- left column: progress -->
        <div class="col-lg-4">
          <div class="card shadow-sm position-sticky top-0 mt-n5">
            <div class="card-body p-4 text-center">
              <h5 class="fw-bold">Your Quest Progress</h5>
              <p class="text-muted small">
                Complete quests to unlock a final reward.
              </p>

              <div class="display-3 fw-bold text-primary-1">
                {{ totalPoints }}
              </div>
              <div class="text-muted small">
                / {{ POINT_GOAL }} POINTS
              </div>

              <div
                class="progress mt-3 mb-2"
                style="height: 20px"
              >
                <div
                  class="progress-bar fw-bold"
                  role="progressbar"
                  :style="{ width: `${progressPercent}%` }"
                >
                  {{ progressPercent }}%
                </div>
              </div>

              <div
                v-if="isComplete"
                class="alert alert-success mt-3"
              >
                <strong>Quest Complete!</strong><br />
                You've unlocked the final reward.
              </div>
            </div>
          </div>
        </div>

        <!-- right column: quests -->
        <div class="col-lg-8">
          <h2 class="fw-bold mb-3">Available Quests</h2>

          <!-- quest 1: music card -->
          <div class="card quest-card mb-3 shadow-sm">
            <div class="card-body p-4 d-flex align-items-center">
              <i class="fab fa-spotify fa-3x text-success me-4"></i>
              <div class="flex-grow-1">
                <h5 class="fw-bold">Music Discovery</h5>
                <p class="text-muted small mb-1">
                  Listen to {{ artistName }} on Spotify to earn points.
                </p>
                <div class="text-primary-1 fw-bold">
                  +{{ quests.music.points }} / {{ MUSIC_MAX }} Points
                </div>
              </div>
              <button
                class="btn btn-success"
                @click="showMusicQuest = true"
                :disabled="isMusicQuestDone"
              >
                <i class="fas fa-play me-2"></i>
                {{ isMusicQuestDone ? 'Completed' : 'Start Quest' }}
              </button>
            </div>
          </div>

          <!-- quest 2: trivia card -->
          <div class="card quest-card mb-3 shadow-sm">
            <div class="card-body p-4 d-flex align-items-center">
              <i class="fas fa-question-circle fa-3x text-warning me-4"></i>
              <div class="flex-grow-1">
                <h5 class="fw-bold">Artist Trivia</h5>
                <p class="text-muted small mb-1">
                  Score a perfect {{ TRIVIA_QS }} / {{ TRIVIA_QS }} on the artist
                  trivia.
                </p>
                <div class="text-primary-1 fw-bold">
                  +{{ quests.trivia.points }} / {{ TRIVIA_AWARD }} Points
                </div>
              </div>
              <button
                class="btn btn-warning"
                @click="showTriviaQuest = true"
                :disabled="isTriviaQuestDone"
              >
                <i class="fas fa-pencil-alt me-2"></i>
                {{ isTriviaQuestDone ? 'Completed' : 'Start Trivia' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- final reward modal -->
    <div
      class="modal fade"
      id="rewardModal"
      tabindex="-1"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content overflow-hidden">
          <div class="modal-body p-0 text-center">
            <div class="p-4 bg-success text-white">
              <i
                class="fas fa-trophy fa-3x"
              ></i>
              <h2 class="mt-3 mb-0">Quest Complete!</h2>
            </div>
            <div class="p-4 p-md-5">
              <p class="lead">
                You've earned {{ totalPoints }} points and unlocked the
                final reward!
              </p>
              <p class="text-muted">
                Use this access code for your special perk:
              </p>
              <div
                class="display-6 fw-bold text-primary-1 bg-light p-3 rounded"
              >
                {{ event.rewardCode || 'REWARD-123' }}
              </div>
              <button
                classs="btn btn-success btn-lg mt-4"
                data-bs-dismiss="modal"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 
    OVERLAYS 
    These are now rendered at the root of the component,
    and shown/hidden with v-if
  -->
  <MusicQuest
    v-if="showMusicQuest"
    :artist-name="artistName"
    :quest-data="quests.music"
    @update-progress="handleMusicProgress"
    @close="showMusicQuest = false"
  />

  <TriviaQuest
    v-if="showTriviaQuest"
    :artist-name="artistName"
    :quest-data="quests.trivia"
    @update-progress="handleTriviaProgress"
    @close="showTriviaQuest = false"
  />

</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
// fix: use relative paths instead of '@' alias
import { useUserStore } from '../store/user.js';
import { db } from '../firebase.js';
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { Modal } from 'bootstrap';

// --- Import the new components ---
// (Assuming they are in the same 'components' folder)
import MusicQuest from './MusicQuest.vue';
import TriviaQuest from './TriviaQuest.vue';

// --- configuration ---
const MUSIC_MAX = 300;
const TRIVIA_AWARD = 200;
const TRIVIA_QS = 5; // Need this for the card text
const POINT_GOAL = MUSIC_MAX + TRIVIA_AWARD;

// --- component setup ---
const props = defineProps({ id: { type: [String, Number], required: false } });
const route = useRoute();
const userStore = useUserStore();
const eventId = props.id ?? route.params.id;
const userId = userStore.currentUser ? userStore.currentUser.uid : null;

// --- local state ---
const isLoading = ref(true);
const error = ref(null);
const event = ref(null);
const artistName = ref('the artist');
const rewardModal = ref(null);

// --- NEW state for showing overlays ---
const showMusicQuest = ref(false);
const showTriviaQuest = ref(false);

// quest state
const quests = ref({
  music: { points: 0, completed: false },
  trivia: { points: 0, completed: false },
});

// --- computed properties ---
const totalPoints = computed(() => {
  return quests.value.music.points + quests.value.trivia.points;
});

const progressPercent = computed(() => {
  if (!POINT_GOAL) return 0;
  return Math.min(Math.round((totalPoints.value / POINT_GOAL) * 100), 100);
});

const isComplete = computed(() => totalPoints.value >= POINT_GOAL);

// Computed props for button disabled state
const isMusicQuestDone = computed(() => quests.value.music.completed);
const isTriviaQuestDone = computed(() => quests.value.trivia.completed);


// --- database path helpers ---
const eventDocRef = doc(db, 'events', eventId);
const progressDocRef = doc(
  db,
  'users',
  userId,
  'eventProgress',
  eventId
);

// --- lifecycle ---
onMounted(async () => {
  if (!userId) {
    error.value = 'you must be logged in to view this page.';
    isLoading.value = false;
    return;
  }
  
  rewardModal.value = new Modal(document.getElementById('rewardModal'));

  await loadEventDetails();

  if (event.value) {
    await loadProgress();
  }

  // Check for spotify redirect *on load*
  // If the user is returning from Spotify, show the MusicQuest overlay immediately.
  const params = new URLSearchParams(window.location.search);
  if (params.has('code')) {
    showMusicQuest.value = true;
  }

  isLoading.value = false;
});

// --- data loading functions ---
async function loadEventDetails() {
  try {
    const docSnap = await getDoc(eventDocRef);
    if (docSnap.exists()) {
      event.value = docSnap.data();
      artistName.value =
        event.value.performer?.[0]?.name || event.value.title;
    } else {
      error.value = 'this event does not exist.';
    }
  } catch (e) {
    console.error('error loading event:', e);
    error.value = 'could not load event details. please try again.';
  }
}

async function loadProgress() {
  try {
    const docSnap = await getDoc(progressDocRef);
    if (docSnap.exists()) {
      const progress = docSnap.data();
      if (progress.music) quests.value.music = progress.music;
      if (progress.trivia) quests.value.trivia = progress.trivia;
      
      if (progress.rewardClaimed) {
         quests.value.music.points = MUSIC_MAX;
         quests.value.trivia.points = TRIVIA_AWARD;
      }
    } else {
      await saveProgress();
    }
  } catch (e) {
    console.error('error loading progress:', e);
  }
}

async function saveProgress() {
  try {
    await setDoc(progressDocRef, {
      music: quests.value.music,
      trivia: quests.value.trivia,
      lastUpdated: Timestamp.now(),
    });
  } catch (e) {
    console.error('failed to save progress:', e);
  }
}


// --- quest handlers ---
async function handleMusicProgress(progress) {
  if (progress.points > quests.value.music.points) {
    quests.value.music.points = progress.points;
    quests.value.music.completed = progress.completed;
    await saveProgress();
    checkForCompletion();
  }
  // Close the overlay
  showMusicQuest.value = false;
}

async function handleTriviaProgress(progress) {
  if (progress.points > quests.value.trivia.points) {
    quests.value.trivia.points = progress.points;
    quests.value.trivia.completed = progress.completed;
    await saveProgress();
    checkForCompletion();
  }
  // Close the overlay
  showTriviaQuest.value = false;
}

// --- reward logic ---
async function checkForCompletion() {
  if (isComplete.value) {
    await setDoc(progressDocRef, 
      { rewardClaimed: true }, 
      { merge: true }
    );
    rewardModal.value.show();
  }
}
</script>


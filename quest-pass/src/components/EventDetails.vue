<template>
  <!-- loading spinner -->
  <div
    v-if="isLoading"
    class="d-flex justify-content-center align-items-center vh-100"
  >
    <!-- MODIFICATION: Replaced Bootstrap spinner with a custom one -->
    <div class="custom-loader"></div>
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
      :style="{ backgroundImage: 'url(' + (event.bannerImage || FALLBACK_BANNER_IMAGE) + ')' }"
    >
  <!-- Added container-lg for better responsiveness on large screens -->
      <div class="container-lg p-4 p-md-5">
        <h1 class="display-4 fw-bold text-white mb-2">
          {{ event.title }}
        </h1>
        <h4 class="text-white-75 mb-2">{{ event.date }}</h4>
        <div class="meta-chips d-flex flex-wrap gap-2 mt-2">
          <span class="chip"><font-awesome-icon :icon="['fas','map-marker-alt']" class="me-1" /> {{ event.venueName }}, {{ event.venueCity }}</span>
          <span class="chip"><font-awesome-icon :icon="['fas','star']" class="me-1" /> Points to goal: {{ Math.max(POINT_GOAL - totalPoints, 0) }}</span>
        </div>
      </div>
    </header>

    <!-- Decorative wave divider between hero and content (nice visual transition) -->
    <div class="wave-divider" aria-hidden="true">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,32 C220,96 450,0 720,32 C990,64 1220,16 1440,80 L1440,120 L0,120 Z" fill="rgba(255,255,255,0.95)"/>
      </svg>
    </div>

    <!-- 
      MODIFICATION:
      - Changed 'container my-5' to 'container-lg main-content-wrapper pb-5'
      - This new class pulls the content up to overlap the banner
    -->
    <main class="container-lg main-content-wrapper pb-5 px-3 px-md-0">
      <!-- Full-width progress summary below banner, above quests -->
      <div class="row g-4 mb-2">
        <div class="col-12">
          <div class="card shadow progress-summary-card animate-float-in">
            <div class="card-body p-4 p-md-5 text-center">
              <div class="d-flex flex-column flex-md-row align-items-center justify-content-between gap-4">
                <div class="text-start flex-grow-1">
                  <h5 class="fw-bold mb-1">Your Quest Progress</h5>
                  <p class="text-muted small mb-0">Complete quests to unlock a final reward.</p>
                </div>

                <div class="d-flex align-items-center gap-4">
                  <div class="score-ring" :style="{ '--p': progressPercent + '%' }">
                    <div class="score-number gradient-text fw-bold">{{ totalPoints }}</div>
                  </div>
                  <div class="text-start">
                    <div class="text-muted small">of {{ POINT_GOAL }} points</div>
                    <div class="progress mt-2" style="height: 14px; min-width: 220px;">
                      <div class="progress-bar fw-bold progress-bar-striped progress-bar-animated" role="progressbar" :style="{ width: `${progressPercent}%` }">{{ progressPercent }}%</div>
                    </div>
                    <div v-if="isComplete" class="badge bg-success mt-2">Quest Complete!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Two quest cards side-by-side on md+, stacked on mobile -->
      <div class="row g-4 mt-1">
        <div class="col-12">
          <h2 class="fw-bold mb-2">Available Quests</h2>
        </div>

        <!-- Music Quest Card -->
        <div class="col-12 col-md-6 d-flex">
          <div class="card quest-card quest-music h-100 w-100 shadow-sm">
            <div class="card-body p-4 d-flex align-items-center">
              <div class="quest-icon" aria-hidden="true">
                <font-awesome-icon :icon="['fab','spotify']" />
              </div>
              <div class="flex-grow-1">
                <h5 class="fw-bold mb-1">Music Discovery</h5>
                <p class="text-muted mb-2">
                  We’ll check your recently played tracks. If we find songs by
                  <strong>{{ artistName }}</strong> played at least 5 times, you earn
                  <strong>{{ MUSIC_MAX }} points</strong>.
                </p>
                <div class="text-primary-1 fw-bold mb-2">+{{ quests.music.points }} / {{ MUSIC_MAX }} Points</div>
                <button class="btn qp-btn" @click="showMusicQuest = true" :disabled="isMusicQuestDone === true">
                  <i class="fas fa-play me-2"></i>
                  {{ isMusicQuestDone ? 'Completed' : 'Start Quest' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Trivia Quest Card -->
        <div class="col-12 col-md-6 d-flex">
          <div class="card quest-card quest-trivia h-100 w-100 shadow-sm">
            <div class="card-body p-4 d-flex align-items-center">
              <div class="quest-icon" aria-hidden="true">
                <i class="fas fa-record-vinyl"></i>
              </div>
              <div class="flex-grow-1">
                <h5 class="fw-bold mb-1">Artist Trivia</h5>
                <p class="text-muted small mb-2">
                  Score a perfect {{ TRIVIA_QS }} / {{ TRIVIA_QS }} on the artist trivia.
                </p>
                <div class="text-primary-1 fw-bold mb-2">+{{ quests.trivia.points }} / {{ TRIVIA_AWARD }} Points</div>
                <button class="btn qp-btn" @click="showTriviaQuest = true" :disabled="isTriviaQuestDone">
                  <i class="fas fa-pencil-alt me-2"></i>
                  {{ isTriviaQuestDone ? 'Completed' : 'Start Trivia' }}
                </button>
              </div>
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
            <!-- MODIFICATION: Added a gradient to the modal header -->
            <div class="p-4 modal-reward-header text-white">
              <!-- MODIFICATION: Added 'animate-tada' class to the icon -->
              <i
                class="fas fa-trophy fa-3x animate-tada"
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
              <!-- MODIFICATION: Added border to make the code stand out -->
              <div
                class="display-6 fw-bold text-primary-1 bg-light p-3 rounded border"
              >
                {{ event.rewardCode || 'REWARD-123' }}
              </div>
              <button
                class="btn btn-success btn-lg mt-4"
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
// Jambase API key (same as Home.vue)
const apiKey = import.meta.env.VITE_JAMBASE_API_KEY;

// --- component setup ---
const props = defineProps({ id: { type: [String, Number], required: false } });
const route = useRoute();
const userStore = useUserStore();
const eventId = props.id ?? route.params.id;
// const userId = userStore.currentUser ? userStore.currentUser.uid : null;
const userId = computed(() => userStore.currentUser?.uid || null);

// --- local state ---
const isLoading = ref(true);
const error = ref(null);
const event = ref(null);
const artistName = ref('the artist');
const rewardModal = ref(null);
const FALLBACK_BANNER_IMAGE = 'https://placehold.co/1200x400/a78bfa/ffffff?text=Event';

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
// const progressDocRef = doc(
//   db,
//   'users',
//   userId,
//   'eventProgress',
//   eventId
// );

// (MusicQuest component owns Spotify auth/check flow)


function getProgressDocRef() {
  if (!userId.value) return null;
  return doc(db, 'users', userId.value, 'eventProgress', eventId);
}

// --- lifecycle ---
// onMounted(async () => {
//   if (!userId) {
//     error.value = 'you must be logged in to view this page.';
//     isLoading.value = false;
//     return;
//   }
  
//   rewardModal.value = new Modal(document.getElementById('rewardModal'));

//   await loadEventDetails();

//   if (event.value) {
//     await loadProgress();
//   }

//   // Check for spotify redirect *on load*
//   // If the user is returning from Spotify, show the MusicQuest overlay immediately.
//   const params = new URLSearchParams(window.location.search);
//   if (params.has('code')) {
//     showMusicQuest.value = true;
//   }

//   isLoading.value = false;
// });

onMounted(async () => {
  try {
    // rewardModal.value = new Modal(document.getElementById('rewardModal'));
    const modalEl = document.getElementById('rewardModal');
try {
  if (modalEl && typeof Modal === 'function') {
    rewardModal.value = new Modal(modalEl);
  }
} catch (e) {
  console.warn('Could not init modal:', e);
}

    // Load event details (Firestore or Jambase)
    await loadEventDetails();

    // Only try to load/save progress if the user is logged in
    if (event.value && userId.value) {
      await loadProgress();
    }

    // If returning from Spotify, open overlay
    // const params = new URLSearchParams(window.location.search);
    // if (params.has('code')) {
    //   showMusicQuest.value = true;
    // }

    if (route.query.spotify === '1') {
  showMusicQuest.value = true;
}
  } finally {
    // Ensure spinner clears even if anything above throws
    isLoading.value = false;
  }
});

function mapJambaseEvent(apiEvent) {
  if (!apiEvent) return null;

  const venueName = apiEvent.venue?.name ?? 'Venue TBA';
  const venueCity = apiEvent.venue?.address?.addressLocality ?? 'Location TBA';
  const startDate = apiEvent.startDate ? new Date(apiEvent.startDate) : null;
  const endDate = apiEvent.endDate ? new Date(apiEvent.endDate) : null;

  const dateStr = startDate
    ? startDate.toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : 'Date TBA';

  return {
    id: apiEvent.id,
    title: apiEvent.name,
    date: `${dateStr} at ${venueName}, ${venueCity}`,
    startDate,
    endDate,
    venueName,
    venueCity,
    description:
      apiEvent.description ||
      (apiEvent.performer?.[0]?.name
        ? `See ${apiEvent.performer?.[0]?.name} live!`
        : 'Check out this event!'),
    bannerImage: apiEvent.image || apiEvent.cardImage || FALLBACK_BANNER_IMAGE,
    rewardCode: null,
    artistName:
      apiEvent.artistName ||
      apiEvent.performer?.[0]?.name ||
      apiEvent.name ||
      'the artist',
  };
}

async function fetchJambaseEventFlexible(idOrName) {
  if (!apiKey) {
    console.error('Missing VITE_JAMBASE_API_KEY');
    return null;
  }

  const url = `https://www.jambase.com/jb-api/v1/events?apikey=${apiKey}&geoCountryIso2=SG`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const list = data.events || [];

  const raw = String(idOrName);
  const decoded = decodeURIComponent(raw);

  // Try by numeric/string id first; if not found, try by name/title match
  const match =
    list.find((e) => String(e.id) === raw) ||
    list.find((e) => e.name === decoded);

  return mapJambaseEvent(match);
}




// --- data loading functions ---
// async function loadEventDetails() {
//   try {
//     const docSnap = await getDoc(eventDocRef);
//     if (docSnap.exists()) {
//       const data = docSnap.data();
//       const startDate = data.startDate?.toDate ? data.startDate.toDate() : null;
//       const endDate = data.endDate?.toDate ? data.endDate.toDate() : null;
//       event.value = {
//         id: docSnap.id,
//         ...data,
//         startDate,
//         endDate,
//         bannerImage:
//           data.bannerImage || data.cardImage || FALLBACK_BANNER_IMAGE,
//       };
//       artistName.value =
//         event.value.artistName ||
//         event.value.performer?.[0]?.name ||
//         event.value.title;
//     } else {
//       error.value = 'this event does not exist.';
//     }
//   } catch (e) {
//     console.error('error loading event:', e);
//     error.value = 'could not load event details. please try again.';
//   }
// }

async function loadEventDetails() {
  // 1) Try Firestore first, but don't abort if it errors
  let fsDoc = null;
  try {
    const docSnap = await getDoc(eventDocRef);
    if (docSnap.exists()) {
      fsDoc = docSnap;
    }
  } catch (e) {
    console.warn('Firestore read failed — falling back to Jambase:', e);
  }

  if (fsDoc) {
    const data = fsDoc.data();
    const startDate = data.startDate?.toDate ? data.startDate.toDate() : null;
    const endDate = data.endDate?.toDate ? data.endDate.toDate() : null;

    event.value = {
      id: fsDoc.id,
      ...data,
      startDate,
      endDate,
      bannerImage: data.bannerImage || data.cardImage || FALLBACK_BANNER_IMAGE,
      // ensure we always have a displayable date string
      date:
        startDate
          ? `${startDate.toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })} at ${data.venueName ?? 'Venue TBA'}, ${data.venueCity ?? 'Location TBA'}`
          : 'Date TBA',
    };

    artistName.value =
      event.value.artistName ||
      event.value.performer?.[0]?.name ||
      event.value.title;

    return; // done (we got Firestore)
  }

  // 2) Firestore not available or no doc — try Jambase by id OR title
  try {
    const jb = await fetchJambaseEventFlexible(eventId);
    if (jb) {
      event.value = jb;
      artistName.value = jb.artistName;
      return;
    }
  } catch (e) {
    console.warn('Jambase fetch failed:', e);
  }

  // 3) Nothing matched anywhere
  error.value = 'could not load event details. please try again.';
}



// async function loadProgress() {
//   try {
//     const docSnap = await getDoc(progressDocRef);
//     if (docSnap.exists()) {
//       const progress = docSnap.data();
//       if (progress.music) quests.value.music = progress.music;
//       if (progress.trivia) quests.value.trivia = progress.trivia;
      
//       if (progress.rewardClaimed) {
//          quests.value.music.points = MUSIC_MAX;
//          quests.value.trivia.points = TRIVIA_AWARD;
//       }
//     } else {
//       await saveProgress();
//     }
//   } catch (e) {
//     console.error('error loading progress:', e);
//   }
// }

async function loadProgress() {
  const progressDocRef = getProgressDocRef();
  if (!progressDocRef) return; // skip if user not logged in

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


// async function saveProgress() {
//   try {
//     await setDoc(progressDocRef, {
//       music: quests.value.music,
//       trivia: quests.value.trivia,
//       lastUpdated: Timestamp.now(),
//     });
//   } catch (e) {
//     console.error('failed to save progress:', e);
//   }
// }

async function saveProgress() {
  const progressDocRef = getProgressDocRef();
  if (!progressDocRef) return; // skip if no user

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
// async function checkForCompletion() {
//   if (isComplete.value) {
//     await setDoc(progressDocRef, 
//       { rewardClaimed: true }, 
//       { merge: true }
//     );
//     rewardModal.value.show();
//   }
// }
async function checkForCompletion() {
  if (!isComplete.value) return;

  const progressDocRef = getProgressDocRef();
  if (!progressDocRef) return; // skip if no user

  await setDoc(progressDocRef, { rewardClaimed: true }, { merge: true });
  rewardModal.value.show();
}




</script>

<!-- NEWLY ADDED <style> BLOCK -->
<style scoped>
/* --- ADDED: Theme variables and accents (scoped but declared on :root globally) --- */
:global(:root) {
  --accent-1: #a78bfa; /* purple */
  --accent-2: #60a5fa; /* blue */
  --accent-3: #7dd3fc; /* cyan */
  --glass-bg: rgba(255, 255, 255, 0.55);
  --glass-border: rgba(255, 255, 255, 0.6);
  --card-elev: 0 12px 30px rgba(16, 24, 40, 0.06);
}

/* subtle animated gradient for the hero overlay */
.event-banner::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1; /* sits between bg and content */
  background: linear-gradient(120deg, rgba(167,139,250,0.14), rgba(96,165,250,0.10), rgba(125,120,255,0.06));
  pointer-events: none;
  mix-blend-mode: overlay;
  animation: slow-pulse 12s linear infinite;
}

@keyframes slow-pulse {
  0% { transform: translateY(0) scale(1); opacity: 0.95 }
  50% { transform: translateY(-6px) scale(1.02); opacity: 1 }
  100% { transform: translateY(0) scale(1); opacity: 0.95 }
}

/* Wave divider */
.wave-divider { position: relative; width: 100%; height: 60px; margin-top: -2px; }
.wave-divider svg { display: block; width: 100%; height: 100%; }

/* --- ADDED: Keyframe Animations --- */
@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

@keyframes float-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes tada {
  from {
    transform: scale3d(1, 1, 1);
  }
  10%, 20% {
    transform: scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -3deg);
  }
  30%, 50%, 70%, 90% {
    transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg);
  }
  40%, 60%, 80% {
    transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg);
  }
  to {
    transform: scale3d(1, 1, 1);
  }
}

/* --- ADDED: Custom Loader --- */
.custom-loader {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 8px solid #f8f9fa; /* Light gray */
  /* Using --bs-primary-1 var if available, otherwise fallback */
  border-top-color: var(--bs-primary-1, #a78bfa);
  animation: spin 1s linear infinite;
}

/* Hide the default spinner text if it's still there */
.spinner-border {
  display: none;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


/* Base page styling */
.event-details-page {
  background-color: #f8f9fa; /* Light gray background */
  min-height: 100vh;
}

/* 1. Header Banner Improvements */
.event-banner {
  background-size: cover;
  background-position: center;
  padding: 6rem 0; /* desktop default */
  position: relative;
  color: white;
  min-height: 380px; /* Give it a solid min-height */
  display: flex;
  align-items: center; /* Center content vertically */
}

/* Dark overlay for text contrast */
.event-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* Darker gradient for better readability */
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.82), rgba(0, 0, 0, 0.56));
  z-index: 2;
}

/* Ensure banner content is above the overlay */
.event-banner .container-lg {
  position: relative;
  z-index: 3;
}

.event-banner h1 {
  color: #ffffff;
  text-shadow: 2px 6px 28px rgba(0, 0, 0, 0.72); /* stronger drop shadow for legibility */
  -webkit-text-stroke: 0.4px rgba(0,0,0,0.35);
}

.event-banner h4 {
  color: rgba(255,255,255,0.94);
  text-shadow: 1px 3px 12px rgba(0,0,0,0.55);
}

/* 2. Main content positioning */
.main-content-wrapper {
  margin-top: -80px; /* Pull the entire content section up */
  position: relative;
  z-index: 3; /* Make sure it's above the banner */
}

/* 3. Sticky Progress Card */
.progress-card {
  border: 0;
  border-radius: 0.5rem; /* Bootstrap's default is .25rem, let's soften it */
  background: var(--glass-bg);
  backdrop-filter: blur(8px) saturate(120%);
  border: 1px solid var(--glass-border);
  box-shadow: var(--card-elev);
  overflow: hidden;
  color: #0f1724; /* ensure high contrast text on the semi-transparent card */
}

/* ADDED: Float-in animation */
.animate-float-in {
  animation: float-in 0.6s 0.2s ease-out backwards;
}

/* ADDED: Gradient text for points */
.gradient-text {
  background: linear-gradient(
    45deg,
    var(--accent-1),
    var(--accent-2)
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  /* fallback handled by color and background; -webkit-text-fill-color covers WebKit */
  text-shadow: 0 6px 18px rgba(0,0,0,0.18);
}


/* Animate the progress bar */
.progress-bar {
  transition: width 0.6s ease;
}

/* Progress summary card (full-width under banner) */
.progress-summary-card {
  border: 0;
  border-radius: 0.75rem;
  background: #fff;
  box-shadow: var(--card-elev);
}

/* 4. Quest Card Enhancements */
.quest-card {
  border: 0;
  border-radius: 0.5rem;
  /* MODIFICATION: Smoother, bouncier transition */
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    box-shadow 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden; /* Good for icons */
  transform-origin: center;
  will-change: transform;
}

/* Make sure the card body uses a stable flex layout so the icon sits left of the content */
.quest-card .card-body {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.quest-card:hover {
  transform: translateY(-8px); /* More lift */
  /* MODIFICATION: Softer, more pronounced shadow on hover */
  box-shadow: 0 0.8rem 2rem rgba(0, 0, 0, 0.1) !important;
  transform: perspective(900px) rotateX(1deg) translateY(-8px) scale(1.01);
}

/* New class for the round icons */
.quest-card .quest-icon {
  flex-shrink: 0;
  width: 78px;
  height: 78px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.25rem;
  color: #fff;
  position: relative;
  box-shadow: 0 8px 18px rgba(0,0,0,0.15);
  /* Vinyl disc look */
  background: radial-gradient(circle at 50% 45%, #262b3a 0%, #0d111a 65%, #0a0e15 100%);
}

/* Grooves */
.quest-card .quest-icon::before {
  content: '';
  position: absolute; inset: 10%;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle,
    rgba(255,255,255,0.06) 0px,
    rgba(255,255,255,0.06) 2px,
    rgba(255,255,255,0) 3px,
    rgba(255,255,255,0) 4px
  );
  filter: blur(0.2px);
}

/* Label */
.quest-card .quest-icon::after {
  content: '';
  position: absolute;
  width: 26px; height: 26px;
  border-radius: 50%;
  background: conic-gradient(from 120deg, var(--accent-1), var(--accent-2));
  box-shadow: inset 0 0 0 2px rgba(255,255,255,0.25);
}

/* icon inside label */
.quest-card .quest-icon svg, .quest-card .quest-icon i {
  position: relative;
  z-index: 1;
  font-size: 18px;
  width: 18px; height: 18px;
  color: #fff;
}

/* playful floating orb behind the icon */
/* Spin vinyl on hover */
.quest-card:hover .quest-icon { animation: spin 1.8s linear infinite; }

/* subtle background for quest cards to make them less flat */
.quest-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,249,255,0.98));
  border: 1px solid rgba(15,23,36,0.03);
}

.quest-card .quest-icon i {
  font-size: 1.75rem; /* A bit smaller than 3x, fits circle better */
  line-height: 1; /* Fixes potential alignment issues */
}

/* Ensure card body text is dark for contrast against page/bg */
.quest-card .card-body,
.progress-card .card-body,
.event-details-page .card-body {
  color: #0f1724;
}

/* Buttons: add subtle dark text shadows to improve legibility on bright colors */
.btn {
  text-shadow: 0 1px 0 rgba(0,0,0,0.12);
}

/* 5. Reward Modal */
.modal-content {
  border: 0;
  border-radius: 0.75rem; /* Softer modal corners */
}

/* ADDED: Animate the trophy icon */
.animate-tada {
  /* This will run when the modal appears */
  animation: tada 1s ease;
}


/* Gradient header for the reward modal */
.modal-reward-header {
  /* Using --bs-success to respect Bootstrap's variables */
  background: linear-gradient(
    45deg,
    var(--bs-success),
    #157347
  );
}

/* subtle floating decorative shapes for desktop
   reduced and muted so they blend with the page background and don't create a large purple area */
.event-details-page::before,
.event-details-page::after {
  content: '';
  position: absolute;
  z-index: 0; /* keep behind content */
  pointer-events: none;
  border-radius: 50%;
  filter: blur(18px);
  /* match the page background so shapes blend in */
  background: radial-gradient(circle, rgba(248,249,250,1), rgba(248,249,250,0.95));
  opacity: 0.95;
}
.event-details-page::before {
  width: 160px;
  height: 160px;
  right: -40px;
  top: 20px;
}
.event-details-page::after {
  width: 140px;
  height: 140px;
  left: -40px;
  bottom: 80px;
}

/* make the progress number pop with a conic ring */
.progress-card .display-3 {
  position: relative;
  display: inline-block;
  padding: 0.35rem 0.6rem;
  border-radius: 12px;
}
.progress-card .display-3::before {
  content: '';
  position: absolute;
  inset: -8px;
  z-index: -1;
  border-radius: 16px;
  background: conic-gradient(from 120deg, var(--accent-2), var(--accent-1), var(--accent-3));
  filter: blur(18px);
  opacity: 0.25;
}

/* small responsive tweaks */
@media (max-width: 767.98px) {
  .event-details-page::before, .event-details-page::after { display: none; }
  .wave-divider { height: 44px }
  .progress-summary-card .score-ring { margin: 0 auto; }
  .progress-summary-card .progress { min-width: 0 !important; }
  .quest-card .quest-icon { width: 64px; height: 64px; }
}

/* --- Responsive layout improvements --- */
/* Scale hero heading and reduce padding on smaller screens */
.event-banner h1 {
  font-size: clamp(1.6rem, 3.6vw, 2.5rem);
  line-height: 1.15;
  word-break: break-word;
}
.event-banner h4 { font-size: clamp(1rem, 2.6vw, 1.25rem); }

@media (max-width: 991.98px) {
  .event-banner { padding: 4rem 0; min-height: 320px; }
  .main-content-wrapper { margin-top: -56px; }
  /* Turn off sticky on tablets/phones to avoid overlap glitches */
  .progress-card.position-sticky { position: static !important; top: auto !important; }
}

@media (max-width: 767.98px) {
  .event-banner { padding: 3rem 0; min-height: 280px; }
  .main-content-wrapper { margin-top: -32px; }

  /* Quest card: make layout wrap so the button goes full-width below text */
  .quest-card .card-body { flex-wrap: wrap; align-items: flex-start; }
  .quest-card .card-body > button { flex: 1 1 100%; margin-top: 0.75rem;  position: relative;z-index: 2;pointer-events: auto;}
  .quest-card .quest-icon { width: 56px; height: 56px; margin-right: 1rem; }
  .quest-card .quest-icon svg { width: 28px; height: 28px; }
}

@media (max-width: 575.98px) {
  .main-content-wrapper { margin-top: -20px; }
}

/* ======= Visual Enhancements (meta chips, score ring, gradient buttons, borders) ======= */
/* Meta chips under the hero title */
.meta-chips .chip {
  display: inline-flex;
  align-items: center;
  gap: .25rem;
  padding: .35rem .6rem;
  font-size: .85rem;
  border-radius: 999px;
  background: rgba(255,255,255,.18);
  color: #fff;
  border: 1px solid rgba(255,255,255,.35);
  backdrop-filter: blur(4px);
}

/* Radial score ring using a CSS variable --p as percentage */
.score-ring {
  --p: 0%;
  width: 122px;
  height: 122px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background:
    radial-gradient(closest-side, #fff 70%, transparent 72%),
    conic-gradient(var(--accent-1) var(--p), #e9e7ff 0);
  box-shadow: 0 12px 30px rgba(16,24,40,.06);
  position: relative;
}
.score-ring::after {
  content: '';
  position: absolute; inset: -10px;
  border-radius: 50%;
  background: radial-gradient(60% 60% at 50% 40%, rgba(255,255,255,.4), transparent 60%);
  pointer-events: none;
}
.score-number { font-size: 2rem; line-height: 1; }

/* Themed gradient buttons to match app-wide tokens */
.qp-btn {
  background: linear-gradient(90deg, var(--accent-1) 0%, var(--accent-2) 100%);
  color: #fff;
  border: 0;
  box-shadow: 0 8px 20px rgba(96,165,250,.20);
}
.qp-btn:hover { box-shadow: 0 12px 26px rgba(96,165,250,.35); transform: translateY(-1px); }
.qp-btn:disabled { opacity: .7; filter: grayscale(.1); }

/* Subtle gradient border on hover via pseudo element */
.quest-card { position: relative; }
.quest-card::before {
  content: '';
  position: absolute; inset: 0; border-radius: 8px;
  padding: 1px; background: linear-gradient(135deg, rgba(167,139,250,.5), rgba(96,165,250,.5));
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  opacity: 0; transition: opacity .25s ease;
  pointer-events: none; /* add this line */
}
.quest-card:hover::before { opacity: 1; }

/* Score ring responsive sizing */
@media (max-width: 767.98px) {
  .score-ring { width: 110px; height: 110px; }
  .score-number { font-size: 1.75rem; }
}

</style>



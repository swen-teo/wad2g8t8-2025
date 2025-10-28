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

          <!-- quest 1: music -->
          <div class="card quest-card mb-3 shadow-sm">
            <div class="card-body p-4 d-flex align-items-center">
              <i
                class="fab fa-spotify fa-3x text-success me-4"
              ></i>
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
                @click="startSpotifyQuest"
                :disabled="isMusicQuestDone"
              >
                <i
                  class="fas fa-play me-2"
                ></i>
                {{ isMusicQuestDone ? 'Completed' : 'Start Quest' }}
              </button>
            </div>
          </div>

          <!-- quest 2: trivia -->
          <div class="card quest-card mb-3 shadow-sm">
            <div class="card-body p-4 d-flex align-items-center">
              <i
                class="fas fa-question-circle fa-3x text-warning me-4"
              ></i>
              <div class="flex-grow-1">
                <h5 class="fw-bold">Artist Trivia</h5>
                <p class="text-muted small mb-1">
                  Score a perfect {{ TRIVIA_QS }} / {{ TRIVIA_QS }} on the
                  artist quiz.
                </p>
                <div class="text-primary-1 fw-bold">
                  +{{ quests.trivia.points }} / {{ TRIVIA_AWARD }} Points
                </div>
              </div>
              <button
                class="btn btn-warning"
                @click="startTriviaQuest"
                :disabled="isTriviaQuestDone"
              >
                <i
                  class="fas fa-pencil-alt me-2"
                ></i>
                {{ isTriviaQuestDone ? 'Completed' : 'Start Quiz' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- ----------------------- -->
    <!-- Modals -->
    <!-- ----------------------- -->

    <!-- spotify quest helper modal -->
    <div
      class="modal fade"
      id="spotifyModal"
      tabindex="-1"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body p-5 text-center">
            <h4 class="mb-3">Connecting to Spotify...</h4>
            <div
              class="spinner-border text-success"
              role="status"
            >
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted small mt-3">
              You will be redirected to Spotify to log in. Please wait.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- trivia quiz modal -->
    <div
      class="modal fade"
      id="quizModal"
      tabindex="-1"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">
              {{ artistName }} Trivia Quiz
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body p-4 p-md-5">
            <!-- loading state -->
            <div
              v-if="quizLoading"
              class="text-center p-5"
            >
              <div
                class="spinner-border text-warning"
                role="status"
              ></div>
              <p class="mt-3 text-muted">Generating your quiz...</p>
            </div>

            <!-- results state -->
            <div
              v-else-if="quizCompleted"
              class="text-center p-4"
            >
              <h2 class="fw-bold">Quiz Complete!</h2>
              <h3
                class="display-4 fw-bold"
                :class="
                  quizScore === TRIVIA_QS
                    ? 'text-success'
                    : 'text-warning'
                "
              >
                {{ quizScore }} / {{ TRIVIA_QS }}
              </h3>
              <p
                v-if="quizScore === TRIVIA_QS"
                class="lead text-success"
              >
                Perfect score! You earned {{ TRIVIA_AWARD }} points!
              </p>
              <p
                v-else
                class="lead text-warning"
              >
                Nice try! You need a perfect score to earn the points. Feel
                free to try again.
              </p>
              <button
                class="btn btn-primary mt-3"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>

            <!-- question state -->
            <div v-else-if="currentQuizQuestion">
              <p class="text-muted small text-end">
                Question {{ quizCurrentIndex + 1 }} of
                {{ quizQuestions.length }}
              </p>
              <h4 class="fw-bold mb-4">
                {{ currentQuizQuestion.question }}
              </h4>
              <div class="d-grid gap-2">
                <button
                  v-for="(option, index) in currentQuizQuestion.options"
                  :key="index"
                  class="btn btn-outline-secondary btn-lg text-start"
                  :class="{ active: selectedAnswer === option }"
                  @click="selectedAnswer = option"
                >
                  {{ option }}
                </button>
              </div>
              <div class="d-flex justify-content-end mt-4">
                <button
                  class="btn btn-primary"
                  @click="submitAnswer"
                  :disabled="selectedAnswer === null"
                >
                  Next
                  <i
                    class="fas fa-arrow-right ms-2"
                  ></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
// fix: use relative paths instead of '@' alias
import { generateQuizQuestions } from '../services/gemini-quiz.js';
// we need to import Modal from bootstrap to control it from js
import { Modal } from 'bootstrap';

// --- configuration ---
const POINT_GOAL = 500;
const MUSIC_MAX = 300;
const TRIVIA_QS = 5; // 5 questions for a quicker demo
const TRIVIA_AWARD = 200;

// spotify pkce (no client secret)
const SPOTIFY_CLIENT_ID = 'your-spotify-client-id-here'; // <-- ⚠️ replace this!
const SPOTIFY_REDIRECT_URI = window.location.origin + window.location.pathname;
const SPOTIFY_SCOPES = ['user-read-recently-played'];
const SPOTIFY_AUTH = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN = 'https://accounts.spotify.com/api/token';
const SPOTIFY_RECENTLY_PLAYED =
  'https://api.spotify.com/v1/me/player/recently-played?limit=50';

// --- component setup ---
// accept `id` as a prop (route props) but fall back to the route param
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
const spAccessToken = ref(null);

// refs for our bootstrap modals
const spotifyModal = ref(null);
const quizModal = ref(null);
const rewardModal = ref(null);

// quest state
const quests = ref({
  music: { points: 0, completed: false },
  trivia: { points: 0, completed: false },
});

// quiz state
const quizLoading = ref(false);
const quizCompleted = ref(false);
const quizQuestions = ref([]);
const quizCurrentIndex = ref(0);
const selectedAnswer = ref(null);
const quizScore = ref(0);

// --- computed properties ---
const totalPoints = computed(() => {
  return quests.value.music.points + quests.value.trivia.points;
});

const progressPercent = computed(() => {
  if (!POINT_GOAL) return 0;
  return Math.min(Math.round((totalPoints.value / POINT_GOAL) * 100), 100);
});

const isComplete = computed(() => totalPoints.value >= POINT_GOAL);
const isMusicQuestDone = computed(() => quests.value.music.completed);
const isTriviaQuestDone = computed(() => quests.value.trivia.completed);

const currentQuizQuestion = computed(() => {
  return quizQuestions.value[quizCurrentIndex.value] || null;
});

// --- database path helpers ---
// path to this event's main document
const eventDocRef = doc(db, 'events', eventId);
// path to this user's progress *for this event*
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

  // init the modal instances
  spotifyModal.value = new Modal(document.getElementById('spotifyModal'));
  quizModal.value = new Modal(document.getElementById('quizModal'));
  rewardModal.value = new Modal(document.getElementById('rewardModal'));

  // 1. load event details
  await loadEventDetails();
  // 2. if we have an event, load progress
  if (event.value) {
    await loadProgress();
  }
  // 3. check if this is a spotify redirect
  await handleSpotifyRedirectIfAny();

  isLoading.value = false;
});

// --- data loading functions ---
async function loadEventDetails() {
  try {
    const docSnap = await getDoc(eventDocRef);
    if (docSnap.exists()) {
      event.value = docSnap.data();
      // get the artist name for the quests
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
      // merge saved progress into our local state
      if (progress.music) quests.value.music = progress.music;
      if (progress.trivia) quests.value.trivia = progress.trivia;
      
      // check if we've already shown the reward
      if (progress.rewardClaimed) {
         // if so, just set points to max
         quests.value.music.points = MUSIC_MAX;
         quests.value.trivia.points = TRIVIA_AWARD;
      }
    } else {
      // no progress doc exists, so we create one
      await saveProgress();
    }
  } catch (e) {
    console.error('error loading progress:', e);
    // we can continue, the user will just have 0 points
  }
}

// save the *entire* quest state to firestore
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

// --- quest 1: spotify ---

// helper to generate a random string
function generateCodeVerifier(length) {
  let text = '';
  const possible =
    'abcdefghijklmnopqrstuvwxyz0123456789-._~';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// helper to hash the string
async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('sha-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function startSpotifyQuest() {
  if (isMusicQuestDone.value) return;

  spotifyModal.value.show();

  // pkce flow
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem('spotify_verifier', verifier);

  const params = new URLSearchParams();
  params.append('client_id', SPOTIFY_CLIENT_ID);
  params.append('response_type', 'code');
  params.append('redirect_uri', SPOTIFY_REDIRECT_URI);
  params.append('scope', SPOTIFY_SCOPES.join(' '));
  params.append('code_challenge_method', 's256');
  params.append('code_challenge', challenge);

  // redirect the user to spotify's login
  window.location.href = `${SPOTIFY_AUTH}?${params.toString()}`;
}

async function handleSpotifyRedirectIfAny() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  if (code) {
    // we've just returned from spotify
    spotifyModal.value.show();

    const verifier = localStorage.getItem('spotify_verifier');
    if (!verifier) {
      console.error('no spotify verifier found');
      spotifyModal.value.hide();
      return;
    }

    // get our token
    try {
      const token = await getSpotifyToken(code, verifier);
      spAccessToken.value = token;
      localStorage.removeItem('spotify_verifier');

      // clear the code from the url
      window.history.replaceState({}, '', SPOTIFY_REDIRECT_URI);

      // now, validate the listening
      await validateSpotifyListen();
    } catch (e) {
      console.error('failed to get spotify token:', e);
    } finally {
      spotifyModal.value.hide();
    }
  }
}

async function getSpotifyToken(code, verifier) {
  const params = new URLSearchParams();
  params.append('client_id', SPOTIFY_CLIENT_ID);
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', SPOTIFY_REDIRECT_URI);
  params.append('code_verifier', verifier);

  const result = await fetch(SPOTIFY_TOKEN, {
    method: 'post',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  const { access_token } = await result.json();
  return access_token;
}

async function validateSpotifyListen() {
  if (!spAccessToken.value) {
    return startSpotifyQuest(); // no token, re-auth
  }

  try {
    const result = await fetch(SPOTIFY_RECENTLY_PLAYED, {
      headers: { authorization: `bearer ${spAccessToken.value}` },
    });

    if (!result.ok) {
      // token probably expired, let's try to re-auth
      return startSpotifyQuest();
    }

    const data = await result.json();

    // find all tracks by the correct artist
    const artistTracks = data.items.filter((item) => {
      return item.track.artists.some(
        (a) => a.name.toLowerCase() === artistName.value.toLowerCase()
      );
    });

    // calculate points (e.g., 10 points per listen, max 300)
    const newPoints = Math.min(artistTracks.length * 10, MUSIC_MAX);

    if (newPoints > quests.value.music.points) {
      quests.value.music.points = newPoints;
      if (newPoints === MUSIC_MAX) {
        quests.value.music.completed = true;
      }
      await saveProgress();
      checkForCompletion();
    }
  } catch (e) {
    console.error('error validating spotify listen:', e);
  }
}

// --- quest 2: trivia ---
async function startTriviaQuest() {
  if (isTriviaQuestDone.value) return;

  // reset quiz state
  quizCompleted.value = false;
  quizLoading.value = true;
  quizQuestions.value = [];
  quizCurrentIndex.value = 0;
  quizScore.value = 0;
  selectedAnswer.value = null;

  quizModal.value.show();
  await loadQuizQuestions();
  quizLoading.value = false;
}

async function loadQuizQuestions() {
  try {
    const questions = await generateQuizQuestions(artistName.value);
    // limit to 5 questions
    quizQuestions.value = questions.slice(0, TRIVIA_QS); 
  } catch (e) {
    console.error('failed to load quiz:', e);
    quizModal.value.hide();
    // show a toast error?
  }
}

function submitAnswer() {
  if (selectedAnswer.value === null) return;

  const question = currentQuizQuestion.value;
  if (selectedAnswer.value === question.correctAnswer) {
    quizScore.value++;
  }

  // move to next question or finish
  if (quizCurrentIndex.value < quizQuestions.value.length - 1) {
    quizCurrentIndex.value++;
    selectedAnswer.value = null;
  } else {
    finishQuiz();
  }
}

async function finishQuiz() {
  quizCompleted.value = true;
  // check for perfect score
  if (quizScore.value === TRIVIA_QS) {
    quests.value.trivia.points = TRIVIA_AWARD;
    quests.value.trivia.completed = true;
    await saveProgress();
    checkForCompletion();
  }
}

// --- reward logic ---
async function checkForCompletion() {
  if (isComplete.value) {
    // save that the reward was claimed
    await setDoc(progressDocRef, 
      { rewardClaimed: true }, 
      { merge: true }
    );
    // show the modal
    rewardModal.value.show();
  }
}
</script>

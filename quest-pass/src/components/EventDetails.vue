<template>
  <div class="event-details-root">
    <!-- Global loading overlay (music-themed) -->
    <Loading :is-loading="isLoading" />

    <div v-if="error" class="container my-5 text-center">
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading">Event Not Found</h4>
        <p>{{ error }}</p>
      </div>
    </div>

    <div v-if="event" class="event-details-page">
      <section
        class="event-banner"
        role="banner"
        :style="{ backgroundImage: 'url(' + (event.bannerImage || FALLBACK_BANNER_IMAGE) + ')' }"
      >
        <div class="event-banner__content container-lg p-4 p-md-5">
            <h4 class="text-white-75 mb-2">{{ event.date }}</h4>
            <h1 class="display-4 fw-bold text-white mb-2">
          {{ event.title }}
        </h1>

        <!-- NEW: date-range panel -->
        <div v-if="dateRangeText" class="date-range-chip mt-2">
          <font-awesome-icon :icon="['fas', 'calendar-days']" class="me-2" />
          This event runs from <strong>{{ dateRangeText }}</strong>
</div>

      <div class="meta-chips d-flex flex-wrap gap-2 mt-2">
                
      <a
      id="venue-chip"
      class="chip chip--clickable"
      :href="mapsSearchUrl"
      target="_blank"
      rel="noopener"
      tabindex="0"
      aria-label="Open venue in Google Maps"
      @click="handleVenueClick"
    >
      <font-awesome-icon icon="fa-solid fa-location-dot" class="me-1" />
      {{ displayVenueName }}, {{ displayVenueCity }}
    </a>

        <div class="chip">
          <font-awesome-icon :icon="['fas', 'star']" class="me-1" />
          Points to goal: {{ pointsRemaining }}
        </div>
        </div></div>
      </section>

      <main class="container-lg main-content-wrapper pb-5 px-3 px-md-0">
        <div class="row g-4 align-items-stretch mb-4">
          <div class="col-12 col-xl-8 d-flex">
            <div class="card shadow progress-summary-card animate-float-in w-100 h-100">
              <div class="card-body p-4 p-xl-5">
                <div class="progress-summary-card__header text-center text-md-start">
                  <h5 class="fw-bold mb-1">Your Quest Progress</h5>
                  <p class="text-muted small mb-0">Complete quests to unlock a final reward.</p>
                </div>

                <div class="progress-summary-card__content mt-4">
                  <div class="row g-4 align-items-stretch h-100">
                    <div class="col-12 col-lg-6 d-flex">
                      <div
                        class="points-progress d-flex flex-column flex-sm-row align-items-center gap-3 gap-md-4 h-100 w-100"
                      >
                        <div class="score-ring flex-shrink-0" :style="{ '--p': progressPercent + '%' }">
                          <div class="score-number gradient-text fw-bold">{{ progressPercent }}%</div>
                        </div>
                        <div class="points-progress__meta text-center text-sm-start">
                          <div class="points-progress__label text-muted text-uppercase small fw-semibold">
                            Points earned
                          </div>
                          <div class="points-progress__value fw-bold text-dark">
                            {{ totalPoints }}
                          </div>
                          <div class="text-muted small">of {{ pointGoal }} points</div>
                          <div class="points-progress__bar mt-3">
                            <div
                              class="points-progress__track"
                              role="progressbar"
                              :aria-valuenow="progressPercent"
                              aria-valuemin="0"
                              aria-valuemax="100"
                              :aria-valuetext="`${totalPoints} of ${pointGoal} points`"
                            >
                              <div class="points-progress__fill" :style="{ width: `${progressPercent}%` }"></div>
                            </div>
                            <div class="points-progress__ticks small text-muted mt-2 d-flex justify-content-between">
                              <span>0</span>
                              <span>{{ pointGoal }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="col-12 col-lg-6 d-flex">
                      <div class="quest-progress-card d-flex flex-column justify-content-between w-100">
                        <div>
                          <div class="quest-progress-card__label text-uppercase small fw-semibold text-muted">
                            Quest completion
                          </div>
                          <div class="quest-progress-card__stat d-flex align-items-end gap-2">
                            <span class="display-6 fw-bold text-dark">{{ completedQuestCount }}</span>
                            <span class="text-muted small">/ {{ totalQuestCount }} quests</span>
                          </div>
                        </div>
                        <div
                          class="quest-progress-card__bar mt-3"
                          role="progressbar"
                          :aria-valuenow="questCompletionPercent"
                          aria-valuemin="0"
                          aria-valuemax="100"
                          :aria-valuetext="`${completedQuestCount} of ${totalQuestCount} quests`"
                        >
                          <div class="quest-progress-card__fill" :style="{ width: `${questCompletionPercent}%` }"></div>
                        </div>
                        <div
                          v-if="isComplete"
                          class="quest-progress-card__status badge quest-progress-card__status--complete mt-3"
                        >
                          Quest Completed!
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div class="col-12 col-xl-4 d-flex">
            <div
              class="card shadow reward-access-card animate-float-in w-100 h-100"
              :class="{
                'reward-access-card--locked': !isComplete,
                'reward-access-card--pending': isComplete && !isRewardUnlocked,
                'reward-access-card--unlocked': isRewardUnlocked,
              }"
            >
              <div class="card-body p-4 p-xl-5 d-flex flex-column gap-4 justify-content-between">
                <div class="reward-access-card__status d-flex flex-column text-start gap-3 gap-sm-4">
                  <div class="reward-access-card__status-row d-flex align-items-center gap-3 gap-sm-4">
                    <div
                      class="status-icon"
                      :class="{
                        'status-icon--pending': isComplete && !isRewardUnlocked,
                        'status-icon--unlocked': isRewardUnlocked,
                      }"
                    >
                      <font-awesome-icon :icon="rewardStatusIcon" />
                    </div>
                    <div class="status-eyebrow text-uppercase small fw-semibold text-muted mb-0">Presale Access</div>
                  </div>
                  <div class="reward-access-card__status-text">
                    <h5 class="fw-bold mb-2">{{ rewardStatusHeading }}</h5>
                    <p class="text-muted small mb-0">{{ rewardStatusMessage }}</p>
                  </div>
                </div>

                <div class="reward-access-card__code text-center text-sm-start">
                  <div class="reward-access-card__code-label text-uppercase small fw-semibold text-muted mb-2">
                    Access Code
                  </div>
                  <div class="code-chip" :class="{ 'code-chip--locked': !isRewardUnlocked }">
                    <span class="code-value">{{ rewardCodeDisplay }}</span>
                    <button
                      v-if="isRewardUnlocked"
                      class="btn btn-primary btn-sm code-copy-btn"
                      type="button"
                      :disabled="isCopyingCode"
                      @click="copyRewardCode"
                    >
                      {{ copyButtonLabel }}
                    </button>
                  </div>
                  <div
                    class="copy-feedback-region small mt-2 mb-0"
                    :class="{ 'is-visible': isRewardUnlocked && copyState !== 'idle' }"
                    aria-live="polite"
                  >
                    <span
                      v-if="isRewardUnlocked && copyState !== 'idle'"
                      :class="feedbackClass"
                    >
                      {{ copyFeedback }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4 available-quests">
          <div class="col-12">
            <h2 class="fw-bold mb-2">Available Quests</h2>
          </div>

          <ScrollObserver class="col-12 col-md-6 d-flex" delay="200ms" direction="left">
            <div class="card quest-card quest-music h-100 w-100">
              <div class="card-body p-4">
                <div class="quest-card__badge" aria-hidden="true">
                  <font-awesome-icon :icon="['fab', 'spotify']" />
                </div>
                <h5 class="fw-bold">Music Discovery</h5>
                <div class="quest-card__content">
                  <p class="quest-card__description text-muted small">
                    We’ll check your recently played tracks. If we find songs by
                    <strong>{{ artistName }}</strong> played at least 5 times, you earn
                    <strong>{{ MUSIC_MAX }} points</strong>.
                  </p>
                  <div class="quest-card__points">+{{ quests.music.points }} / {{ MUSIC_MAX }} Points</div>
                </div>
                <div class="quest-card__actions">
                  <MusicQuestButton
                    class="w-100"
                    @start-quest="showMusicQuest = true"
                    :is-disabled="isMusicQuestDone"
                    :button-text="isMusicQuestDone ? 'Completed' : 'Start Quest'"
                    :icon="['fas', 'play']"
                    icon-class="me-2"
                  />
                </div>
              </div>
            </div>
          </ScrollObserver>

          <ScrollObserver class="col-12 col-md-6 d-flex" delay="300ms" direction="right">
            <div class="card quest-card quest-trivia h-100 w-100">
              <div class="card-body p-4">
                <div class="quest-card__badge" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'music']" class="text-white" />
                </div>
                <h5 class="fw-bold">Artist Trivia</h5>
                <div class="quest-card__content">
                  <p class="quest-card__description text-muted small">
                    Score a perfect {{ TRIVIA_QS }} / {{ TRIVIA_QS }} on the artist trivia.
                  </p>
                  <div class="quest-card__points">+{{ quests.trivia.points }} / {{ TRIVIA_AWARD }} Points</div>
                </div>
                <div class="quest-card__actions">
                  <MusicQuestButton
                    class="w-100"
                    @start-quest="showTriviaQuest = true"
                    :is-disabled="isTriviaQuestDone"
                    :button-text="isTriviaQuestDone ? 'Completed' : 'Start Trivia'"
                    :icon="['fas', 'pen']"
                    icon-class="me-2"
                  />
                </div>
              </div>
            </div>
          </ScrollObserver>
        </div>
      </main>
    </div>

    <div class="modal fade" id="rewardModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered reward-modal__dialog">
        <div class="modal-content overflow-hidden reward-modal">
          <div class="modal-reward-header text-white text-center">
            <div class="reward-modal__icon">
              <font-awesome-icon icon="fa-solid fa-trophy" class="reward-modal__icon-graphic animate-tada" />
            </div>
            <h2 class="mt-3 mb-2">Quest Complete!</h2>
            <p class="reward-modal__subtitle">Final reward unlocked</p>
          </div>
          <div class="modal-body text-center reward-modal__content">
            <p class="lead mb-3">
              You've earned {{ totalPoints }} points and unlocked the final reward!
            </p>
            <p class="text-muted mb-4">
              Use this access code for your special perk:
            </p>
            <div class="reward-modal__code" role="status" aria-live="polite">
              {{ rewardCode || 'CODE-LOCKED' }}
            </div>
            <button class="btn btn-lg mt-5 reward-modal__cta" data-bs-dismiss="modal">
              Awesome!
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Venue Map Modal -->
    <div class="modal fade" id="mapModal" tabindex="-1" aria-labelledby="mapModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content overflow-hidden">
          <div class="modal-header">
            <h5 class="modal-title" id="mapModalLabel">Map – {{ displayVenueName }}, {{ displayVenueCity }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-0">
                    <div class="map-embed-wrapper">
                      <div class="map-overlay-controls">
                        <a class="btn btn-primary btn-sm" :href="mapsSearchUrl" target="_blank" rel="noopener">
                          <font-awesome-icon icon="fa-solid fa-route" class="me-1" />
                          Directions
                        </a>
                        <button class="btn btn-outline-secondary btn-sm" type="button" :disabled="isCopyingAddress" @click="copyVenueAddress">
                          <font-awesome-icon icon="fa-regular fa-copy" class="me-1" />
                          {{ addressCopyLabel }}
                        </button>
                      </div>
                      <iframe
                ref="mapIframe"
                :src="embedMapUrl"
                width="100%"
                height="100%"
                style="border:0;"
                :class="{ 'map-embed--neutral': !mapId }"
                allowfullscreen
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                title="Venue location map"
              ></iframe>
            </div>
          </div>
          <div class="modal-footer d-flex justify-content-between">
            <small class="text-muted">Map based on venue search query</small>
            <a class="btn btn-outline-primary" :href="mapsSearchUrl" target="_blank" rel="noopener">
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>

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
  </div>
</template>


<script setup>
import { ref, computed, onMounted, watch } from 'vue';
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
import { icon } from '@fortawesome/fontawesome-svg-core';
import { faLocationDot, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';

const locationDotSvg = icon(faLocationDot).html.join('');
const externalLinkSvg = icon(faArrowUpRightFromSquare).html.join('');
import { sendRewardUnlockEmail } from '../services/email.js';

// --- Import the new components ---
import MusicQuest from './MusicQuest.vue';
import TriviaQuest from './TriviaQuest.vue';
import MusicQuestButton from './MusicQuestButton.vue';
import Loading from './Loading.vue';
import ScrollObserver from './ScrollObserver.vue';

import {onUnmounted } from 'vue';
import { Popover} from 'bootstrap';
let venuePopover; // keep a handle to dispose later
let mapModalInstance; // modal instance for the venue map

// --- configuration ---
const MUSIC_MAX = 300;
const TRIVIA_AWARD = 200;
const TRIVIA_QS = 5; // Need this for the card text
const DEFAULT_POINT_GOAL = MUSIC_MAX + TRIVIA_AWARD;
const QUEST_MAX_POINTS = {
  music: MUSIC_MAX,
  trivia: TRIVIA_AWARD,
};
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

// --- state for showing overlays ---
const showMusicQuest = ref(false);
const showTriviaQuest = ref(false);

// quest state
const quests = ref({
  music: { points: 0, completed: false },
  trivia: { points: 0, completed: false },
});

// --- computed properties ---
const questList = computed(() => Object.values(quests.value));

const totalPoints = computed(() =>
  questList.value.reduce((sum, quest) => sum + (Number(quest.points) || 0), 0)
);

const pointGoal = computed(() => {
  const raw = event.value?.rewardPointsGoal;
  const numeric = Number(raw);
  return Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric) : DEFAULT_POINT_GOAL;
});

const progressPercent = computed(() => {
  const goal = pointGoal.value;
  if (!goal) return 0;
  return Math.min(Math.round((totalPoints.value / goal) * 100), 100);
});

const pointsRemaining = computed(() => Math.max(pointGoal.value - totalPoints.value, 0));

const completedQuestCount = computed(() =>
  questList.value.filter((quest) => quest.completed === true).length
);

const totalQuestCount = computed(() => questList.value.length);

const questCompletionPercent = computed(() => {
  if (!totalQuestCount.value) return 0;
  return Math.round((completedQuestCount.value / totalQuestCount.value) * 100);
});

const isComplete = computed(() => pointGoal.value > 0 && totalPoints.value >= pointGoal.value);

// Computed props for button disabled state
const isMusicQuestDone = computed(() => quests.value.music.completed);
const isTriviaQuestDone = computed(() => quests.value.trivia.completed);

const APP_NAME = 'Quest Pass';

const userRewardCode = ref(null);

const rewardCode = computed(() => userRewardCode.value);

const userEmail = computed(() => userStore.currentUser?.email || null);
const userDisplayName = computed(() =>
  userStore.currentUser?.name ||
  userStore.currentUser?.displayName ||
  (userEmail.value ? userEmail.value.split('@')[0] : null) ||
  'there'
);

const eventName = computed(() => event.value?.title || event.value?.name || 'your event');

const isRewardUnlocked = computed(
  () => Boolean(rewardCode.value) && isComplete.value
);

const isCopyingCode = ref(false);
const copyState = ref('idle'); // 'idle' | 'copied' | 'error'

const copyButtonLabel = computed(() => {
  if (copyState.value === 'copied') return 'Copied!';
  if (copyState.value === 'error') return 'Try Again';
  return 'Copy Code';
});

const copyFeedback = computed(() => {
  if (copyState.value === 'copied') return 'Code copied to clipboard.';
  if (copyState.value === 'error') return 'Could not copy the code. Please try again.';
  return '';
});

const feedbackClass = computed(() =>
  copyState.value === 'error' ? 'text-danger' : 'text-success'
);

const rewardStatusHeading = computed(() => {
  if (isRewardUnlocked.value) return 'Presale Access Unlocked';
  if (isComplete.value) return 'Presale Access Pending';
  return 'Presale Access Locked';
});

const rewardStatusMessage = computed(() => {
  if (isRewardUnlocked.value) {
    return `Copy your unique code to secure entry to ${artistName.value}'s event.`;
  }
  if (isComplete.value) {
    return 'Your presale window is unlocked. Hang tight while we prepare your code.';
  }
  const remaining = pointsRemaining.value;
  if (remaining > 0) {
    return `Complete quests to earn ${remaining} more points.`;
  }
  return 'Complete the available quests to unlock your presale access.';
});

const rewardStatusIcon = computed(() => {
  if (isRewardUnlocked.value) return ['fas', 'lock-open'];
  if (isComplete.value) return ['fas', 'hourglass-half'];
  return ['fas', 'lock'];
});

const rewardCodeDisplay = computed(() => {
  if (isRewardUnlocked.value) return rewardCode.value;
  if (isComplete.value) return 'PENDING';
  return '••••••';
});

watch(rewardCode, () => {
  copyState.value = 'idle';
});

// --- date-range panel (read from router state passed by Home.vue) ---
const groupMeta = ref(
  (typeof history !== 'undefined' && history.state && history.state.groupMeta)
    ? history.state.groupMeta
    : null
);

function deriveVenueFromTitle(title) {
  if (!title) return null;
  const m1 = title.match(/\bat\s+([^()\-•|,]+?)(?:\s*\(|\s*-\s*|\s*•|\s*\||\s*$)/i);
  if (m1) return m1[1].trim();
  const m2 = title.match(/@\s*([^()\-•|,]+?)(?:\s*\(|\s*-\s*|\s*•|\s*\||\s*$)/i);
  return m2 ? m2[1].trim() : null;
}

function fmtRangeDate(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return 'Date TBA';
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const dateRangeText = computed(() => {
  if (!groupMeta.value?.earliest || !groupMeta.value?.latest) return null;
  const a = fmtRangeDate(groupMeta.value.earliest);
  const b = fmtRangeDate(groupMeta.value.latest);
  return a === b ? a : `${a} – ${b}`;
});

function resetQuestState() {
  quests.value = {
    music: { points: 0, completed: false },
    trivia: { points: 0, completed: false },
  };
  userRewardCode.value = null;
  copyState.value = 'idle';
}


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
// --- GOOGLE MAPS SETUP ---
const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
// Cloud-styled Map ID from Google Maps Platform (Cloud Customization)
const mapId = import.meta.env.VITE_GOOGLE_MAP_ID || '';

// Compute the venue name and city (existing data from event)
const displayVenueName = computed(() =>
  event.value?.venueName || groupMeta?.value?.venueName || 'Venue TBA'
);
const displayVenueCity = computed(() =>
  event.value?.venueCity || groupMeta?.value?.venueCity || 'Singapore'
);

// Build Google Maps URLs
const mapQuery = computed(() => {
  const q = `${displayVenueName.value}, ${displayVenueCity.value}`;
  return encodeURIComponent(q);
});

// High-contrast, neutral style for Static Maps (fallback when cloud style isn't applied)
const MAP_STYLES = [
  'feature:all|saturation:-20|lightness:5',
  'feature:poi|visibility:off',
  'feature:road|saturation:-10|gamma:1.1|lightness:0',
  'feature:road.arterial|lightness:-10',
  'feature:water|color:0xd6e4f0',
  'feature:landscape|color:0xf6f6fb',
  'element:labels.text.fill|color:0x1f2937',
  'element:labels.text.stroke|color:0xffffff|weight:2',
];

function buildStaticStyleQuery() {
  return MAP_STYLES.map((s) => `&style=${encodeURIComponent(s)}`).join('');
}

// Static Maps API image (hover preview)
const staticMapUrl = computed(() => {
  if (!mapsKey) return null;
  const markerColor = '0x4f46e5'; // indigo to match app accents
  const styles = buildStaticStyleQuery();
  return `https://maps.googleapis.com/maps/api/staticmap?size=480x260&scale=2&maptype=roadmap&zoom=13&markers=color:${markerColor}|${mapQuery.value}${styles}&key=${mapsKey}`;
});

// Regular Google Maps search URL (opens new tab)
const mapsSearchUrl = computed(() =>
  `https://www.google.com/maps/search/?api=1&query=${mapQuery.value}`
);

// Prefer the official Embed API when a key is present (better UX and controls);
// fall back to a generic embed that doesn't require a key.
const embedMapUrl = computed(() => {
  const q = mapQuery.value;
  if (mapsKey) {
    const id = mapId ? `&map_id=${encodeURIComponent(mapId)}` : '';
    return `https://www.google.com/maps/embed/v1/search?key=${encodeURIComponent(mapsKey)}&q=${q}${id}`;
  }
  return `https://www.google.com/maps?q=${q}&output=embed`;
});

const mapIframe = ref(null);

// Derived venue label for copying
const venueLabel = computed(() => `${displayVenueName.value}, ${displayVenueCity.value}`);
const isCopyingAddress = ref(false);
const addressCopyState = ref('idle'); // idle | copied | error
const addressCopyLabel = computed(() => {
  if (addressCopyState.value === 'copied') return 'Copied!';
  if (addressCopyState.value === 'error') return 'Try Again';
  return 'Copy address';
});

async function copyVenueAddress() {
  try {
    isCopyingAddress.value = true;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(venueLabel.value);
    } else if (typeof document !== 'undefined') {
      const temp = document.createElement('input');
      temp.value = venueLabel.value;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    } else {
      throw new Error('No clipboard API available');
    }
    addressCopyState.value = 'copied';
  } catch (e) {
    console.error('Failed to copy address:', e);
    addressCopyState.value = 'error';
  } finally {
    isCopyingAddress.value = false;
    setTimeout(() => (addressCopyState.value = 'idle'), 2200);
  }
}

function handleVenueClick(event) {
  // If we have a key (and thus a richer embed), open the modal instead of navigating away.
  if (mapsKey) {
    event?.preventDefault?.();
    if (mapModalInstance) {
      // Setting src explicitly helps when city/name changes across route updates
      if (mapIframe?.value) {
        mapIframe.value.src = embedMapUrl.value;
      }
      mapModalInstance.show();
    }
  }
}

onMounted(async () => {
  // ✅ Only create the popover if we have a maps key AND the element exists
  const el = document.getElementById('venue-chip');
  if (el) {
    venuePopover = new Popover(el, {
      container: 'body',          // <-- ensures it’s above overlays
      trigger: 'hover focus',     // <-- shows on hover; click still opens link
      placement: 'bottom',
      html: true,
      sanitize: false,
      customClass: 'map-popover', // add custom class so we can style globally
      fallbackPlacements: ['top','right','left'],
      content: () => {
        const title = `${displayVenueName.value}, ${displayVenueCity.value}`;
        const media = staticMapUrl.value
          ? `<img src="${staticMapUrl.value}" alt="Map preview of ${title}" class="map-popover-img" />`
          : `<iframe src="${embedMapUrl.value}" class="map-popover-embed" width="420" height="236" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map preview of ${title}"></iframe>`;

        return `
          <div class="map-popover-card">
            <div class="map-popover-media">
              ${media}
              <div class="map-popover-chip">
                <span class="me-1 icon-inline">${locationDotSvg}</span>
                ${title}
              </div>
            </div>
            <div class="map-popover-actions">
              <a href="${mapsSearchUrl.value}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
                <span class="me-1 icon-inline">${externalLinkSvg}</span>
                Open in Google Maps
              </a>
            </div>
          </div>`;
      }
    });
  }

  // (keep the rest of your modal + data loading logic)
  try {
    const modalEl = document.getElementById('rewardModal');
    if (modalEl && typeof Modal === 'function') {
      rewardModal.value = new Modal(modalEl);
    }
    const mapModalEl = document.getElementById('mapModal');
    if (mapModalEl && typeof Modal === 'function') {
      mapModalInstance = new Modal(mapModalEl);
    }
    await loadEventDetails();
    if (event.value && userId.value) await loadProgress();
    if (route.query.spotify === '1') showMusicQuest.value = true;
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  venuePopover?.dispose();
  // Bootstrap doesn't expose a dispose on Modal instance directly; remove listeners by hiding
  try { mapModalInstance?.hide?.(); } catch {}
});

watch(userId, async (newId, oldId) => {
  if (!event.value) return;

  if (newId) {
    try {
      await loadProgress();
    } catch (err) {
      console.error('Failed to refresh quest progress after login:', err);
    }
  } else if (oldId) {
    resetQuestState();
  }
});

function mapJambaseEvent(apiEvent) {
  if (!apiEvent) return null;
  const derivedVenue = deriveVenueFromTitle(apiEvent.name);
  const venueName =
  apiEvent.venue?.name ||
  apiEvent.venue?.venueName ||
  apiEvent.venue?.address?.name ||
  derivedVenue ||
  'Venue TBA';
  
  const venueCity =
  apiEvent.venue?.addressLocality ||
  apiEvent.venue?.address?.addressLocality ||
  apiEvent.venue?.address?.city ||
  apiEvent.venue?.location?.city ||
  apiEvent.venue?.city ||
  'Singapore';
  
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
    rewardPointsGoal: DEFAULT_POINT_GOAL,
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

    const rewardGoal = Number(data.rewardPointsGoal);
    const normalizedGoal =
      Number.isFinite(rewardGoal) && rewardGoal > 0 ? Math.round(rewardGoal) : DEFAULT_POINT_GOAL;

    event.value = {
      id: fsDoc.id,
      ...data,
      rewardPointsGoal: normalizedGoal,
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
      event.value = {
        ...jb,
        rewardPointsGoal: jb.rewardPointsGoal ?? DEFAULT_POINT_GOAL,
      };
      artistName.value = jb.artistName;
      return;
    }
  } catch (e) {
    console.warn('Jambase fetch failed:', e);
  }

  // 3) Nothing matched anywhere
  error.value = 'could not load event details. please try again.';
}

function applyQuestProgress(key, rawProgress) {
  const current = quests.value[key] || { points: 0, completed: false };
  const points = Number(rawProgress?.points);
  const maxPoints = QUEST_MAX_POINTS[key] ?? Infinity;

  let nextPoints = current.points;
  if (Number.isFinite(points)) {
    nextPoints = Math.min(Math.max(0, Math.round(points)), maxPoints);
  }

  quests.value[key] = {
    ...current,
    points: nextPoints,
    completed: rawProgress?.completed === true,
  };
}

async function loadProgress() {
  const progressDocRef = getProgressDocRef();
  if (!progressDocRef) return; // skip if user not logged in

  try {
    const docSnap = await getDoc(progressDocRef);
    if (docSnap.exists()) {
      const progress = docSnap.data();

      if (progress.music) applyQuestProgress('music', progress.music);
      if (progress.trivia) applyQuestProgress('trivia', progress.trivia);

      const storedGoal = Number(progress.goalPoints);
      if (
        Number.isFinite(storedGoal) &&
        storedGoal > 0 &&
        (!event.value?.rewardPointsGoal || event.value.rewardPointsGoal <= 0)
      ) {
        event.value = { ...event.value, rewardPointsGoal: Math.round(storedGoal) };
      }

      if (progress.rewardCode) {
        userRewardCode.value = String(progress.rewardCode || '').toUpperCase();
      } else {
        userRewardCode.value = null;
      }

      if (progress.rewardUnlocked || progress.rewardClaimed || progress.rewardCode) {
        Object.keys(quests.value).forEach((key) => {
          const maxPoints = QUEST_MAX_POINTS[key];
          quests.value[key].completed = true;
          if (Number.isFinite(maxPoints) && maxPoints > 0) {
            const currentPoints = Number(quests.value[key].points) || 0;
            quests.value[key].points = Math.max(currentPoints, maxPoints);
          }
        });

        if (!userRewardCode.value) {
          userRewardCode.value = generateUserRewardCode(event.value?.title);
          await saveProgress({
            rewardUnlocked: true,
            rewardClaimed: progress.rewardClaimed === true,
            rewardUnlockedAt: progress.rewardUnlockedAt || Timestamp.now(),
            rewardCode: userRewardCode.value,
          });
        }
      }
    } else {
      await saveProgress();
    }
  } catch (e) {
    console.error('error loading progress:', e);
  }
}

async function saveProgress(options = {}) {
  const progressDocRef = getProgressDocRef();
  if (!progressDocRef) return; // skip if no user

  const payload = {
    music: quests.value.music,
    trivia: quests.value.trivia,
    totalPoints: totalPoints.value,
    questsCompleted: completedQuestCount.value,
    goalPoints: pointGoal.value,
    rewardUnlocked: options.rewardUnlocked ?? (isComplete.value ? true : false),
    lastUpdated: Timestamp.now(),
  };

  if (userRewardCode.value) {
    payload.rewardCode = userRewardCode.value;
  }

  if (options.rewardCode !== undefined) {
    payload.rewardCode = options.rewardCode;
  }

  if (options.rewardClaimed !== undefined) {
    payload.rewardClaimed = options.rewardClaimed;
  }

  if (options.rewardUnlockedAt) {
    payload.rewardUnlockedAt = options.rewardUnlockedAt;
  }

  try {
    await setDoc(progressDocRef, payload, { merge: true });
  } catch (e) {
    console.error('failed to save progress:', e);
  }
}


// --- quest handlers ---
async function handleMusicProgress(progress) {
  if (progress.points > quests.value.music.points) {
    const previousPoints = quests.value.music.points;
    const delta = Math.max(progress.points - previousPoints, 0);

    if (delta > 0) {
      try {
        await userStore.awardPoints(delta);
      } catch (error) {
        console.error('Failed to award music quest points:', error);
      }
    }

    const maxPoints = QUEST_MAX_POINTS.music ?? progress.points;
    quests.value.music.points = Math.min(progress.points, maxPoints);
    quests.value.music.completed = progress.completed;
    await saveProgress();
    await checkForCompletion();
  }
  // Close the overlay
  showMusicQuest.value = false;
}

async function handleTriviaProgress(progress) {
  if (progress.points > quests.value.trivia.points) {
    const previousPoints = quests.value.trivia.points;
    const delta = Math.max(progress.points - previousPoints, 0);

    if (delta > 0) {
      try {
        await userStore.awardPoints(delta);
      } catch (error) {
        console.error('Failed to award trivia quest points:', error);
      }
    }

    const maxPoints = QUEST_MAX_POINTS.trivia ?? progress.points;
    quests.value.trivia.points = Math.min(progress.points, maxPoints);
    quests.value.trivia.completed = progress.completed;
    await saveProgress();
    await checkForCompletion();
  }
  // Leave the overlay open so users can review the success screen and dismiss manually
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

  const hadRewardCode = Boolean(userRewardCode.value);
  const unlockedAt = Timestamp.now();
  if (!userRewardCode.value) {
    userRewardCode.value = generateUserRewardCode(event.value?.title);
  }
  await saveProgress({
    rewardUnlocked: true,
    rewardClaimed: true,
    rewardUnlockedAt: unlockedAt,
    rewardCode: userRewardCode.value,
  });

  if (!hadRewardCode) {
    await sendRewardUnlockEmail({
      toEmail: userEmail.value,
      toName: userDisplayName.value,
      pointsEarned: totalPoints.value,
      eventName: eventName.value,
      rewardCode: userRewardCode.value,
      appName: APP_NAME,
    });
  }
  if (rewardModal.value?.show) {
    rewardModal.value.show();
  }
}

async function copyRewardCode() {
  if (!rewardCode.value || isCopyingCode.value) return;

  try {
    isCopyingCode.value = true;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(rewardCode.value);
    } else if (typeof document !== 'undefined') {
      const tempInput = document.createElement('input');
      tempInput.value = rewardCode.value;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
    } else {
      throw new Error('No clipboard API available');
    }
    copyState.value = 'copied';
  } catch (error) {
    console.error('Failed to copy reward code:', error);
    copyState.value = 'error';
  } finally {
    isCopyingCode.value = false;
    setTimeout(() => {
      copyState.value = 'idle';
    }, 2500);
  }
}

function generateUserRewardCode(title) {
  const initials = buildTitleInitials(title);
  const digits = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${initials}${digits}`;
}

function buildTitleInitials(title) {
  const fallback = 'EVT';
  if (!title) return fallback;

  const words = String(title)
    .split(/\s+/)
    .filter(Boolean);

  const letters = [];
  for (const word of words) {
    const match = word.match(/[A-Za-z0-9]/);
    if (match) {
      letters.push(match[0].toUpperCase());
    }
    if (letters.length === 3) break;
  }

  while (letters.length < 3) {
    letters.push('X');
  }

  return letters.join('').slice(0, 3);
}




</script>

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


/* Base page styling */
.event-details-page {
  --page-bg:
    radial-gradient(1200px 600px at 50% -10%, var(--bg-1, #fff0ff) 0%, transparent 55%),
    radial-gradient(1000px 500px at 90% 10%, var(--bg-2, #efeaff) 0%, transparent 60%),
    linear-gradient(180deg, var(--bg-3, #f3e9ff) 0%, #f7f3ff 55%, #f9f6ff 100%);
  background: var(--page-bg);
  min-height: 100vh;
  position: relative;
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
  position: relative;
  z-index: 3; /* Keep content above the banner background */
  margin-top: clamp(1.5rem, 3vw, 2.75rem);
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

.progress-summary-card__header p {
  max-width: 32rem;
}

.progress-summary-card__content {
  background: linear-gradient(145deg, rgba(226, 232, 255, 0.32), rgba(244, 244, 255, 0.18));
  border: 1px solid rgba(79, 70, 229, 0.08);
  border-radius: 1.25rem;
  padding: 1.25rem 1.5rem;
}

.points-progress {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 1rem;
  padding: 1.1rem 1.4rem;
  box-shadow: 0 16px 32px rgba(99, 102, 241, 0.08);
}

.points-progress__meta {
  flex: 1 1 auto;
}

.points-progress__label {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.points-progress__value {
  line-height: 1.1;
  font-size: clamp(1.9rem, 3vw, 2.45rem);
}

.points-progress__track {
  position: relative;
  width: min(360px, 100%);
  height: 12px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.18);
  overflow: hidden;
}

.points-progress__fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899);
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);
  transition: width 0.5s ease;
}

.points-progress__ticks span:last-child {
  font-variant-numeric: tabular-nums;
}

.quest-progress-card {
  width: 100%;
  min-width: 0;
  flex: 1 1 auto;
  padding: 1.15rem 1.4rem;
  border-radius: 1rem;
  background: rgba(248, 250, 255, 0.95);
  border: 1px solid rgba(59, 130, 246, 0.15);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6), 0 18px 28px rgba(30, 64, 175, 0.08);
}

.quest-progress-card__label {
  letter-spacing: 0.08em;
}

.quest-progress-card__bar {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.2);
  overflow: hidden;
  position: relative;
}

.quest-progress-card__fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #38bdf8, #6366f1);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25);
  transition: width 0.5s ease;
}

.quest-progress-card__status {
  align-self: flex-start;
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  font-size: 0.75rem;
}

.quest-progress-card__status--complete {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(129, 140, 248, 0.24));
  color: #1e3a8a;
  border: 1px solid rgba(59, 130, 246, 0.4);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.16);
}


.reward-access-card {
  display: flex;
  flex-direction: column;
  border-radius: 1.25rem;
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: linear-gradient(160deg, rgba(255, 248, 241, 0.92), rgba(255, 255, 255, 0.9));
  box-shadow: var(--card-elev);
  position: relative;
  overflow: hidden;
}

.reward-access-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(251, 191, 36, 0.18), transparent 55%);
  opacity: 0.75;
  pointer-events: none;
}


.reward-access-card--locked {
  border-color: rgba(245, 158, 11, 0.25);
}

.reward-access-card--pending {
  background: linear-gradient(160deg, rgba(250, 245, 255, 0.95), rgba(255, 255, 255, 0.92));
  border-color: rgba(129, 140, 248, 0.3);
}

.reward-access-card--unlocked {
  background: linear-gradient(160deg, rgba(236, 253, 245, 0.95), rgba(255, 255, 255, 0.92));
  border-color: rgba(16, 185, 129, 0.35);
}

.reward-access-card--locked::before {
  background: radial-gradient(circle at top right, rgba(251, 191, 36, 0.22), transparent 55%);
}

.reward-access-card--pending::before {
  background: radial-gradient(circle at top right, rgba(129, 140, 248, 0.2), transparent 55%);
}

.reward-access-card--unlocked::before {
  background: radial-gradient(circle at top right, rgba(16, 185, 129, 0.18), transparent 55%);
}

.reward-access-card--summary.reward-access-card--locked {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(253, 244, 235, 0.88));
  border-color: rgba(245, 158, 11, 0.28);
}

.reward-access-card--summary.reward-access-card--pending {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(237, 233, 254, 0.9));
  border-color: rgba(129, 140, 248, 0.3);
}

.reward-access-card--summary.reward-access-card--unlocked {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(222, 247, 236, 0.9));
  border-color: rgba(16, 185, 129, 0.32);
}

@media (min-width: 768px) {
  .progress-summary-card__content .reward-access-card--summary {
    border-left: 1px solid rgba(79, 70, 229, 0.24);
    padding-left: 2rem;
    margin-left: 0.5rem;
  }

  .progress-summary-card__content .reward-access-card--summary::before {
    opacity: 0.75;
  }
}

.reward-access-card .card-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2.5rem;
  flex: 1 1 auto;
}

.reward-access-card__status-text h5 {
  font-size: 1.25rem;
}

.reward-access-card__code-label {
  letter-spacing: 0.08em;
}

.status-icon {
  --status-color: #f59e0b;
  display: inline-flex;
  align-items: center;
  color: var(--status-color);
  font-size: 1.75rem;
  line-height: 1;
}

.status-icon--pending {
  --status-color: #6366f1;
}

.status-icon--unlocked {
  --status-color: #059669;
}

.status-eyebrow {
  letter-spacing: 0.08em;
}

.code-chip {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.9);
  font-family: 'Fira Code', 'SFMono-Regular', ui-monospace, 'DejaVu Sans Mono', monospace;
  font-size: 1.05rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.code-chip--locked {
  border-style: dashed;
  color: rgba(15, 23, 42, 0.35);
  background: rgba(255, 255, 255, 0.75);
}

.code-value {
  flex: 1 1 auto;
  text-align: left;
  margin-right: auto;
}

.code-copy-btn {
  white-space: nowrap;
  min-width: 120px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.copy-feedback-region {
  min-height: 1.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.copy-feedback-region.is-visible {
  opacity: 1;
}

.copy-feedback-space {
  min-height: 1.5rem;
}

@media (max-width: 767.98px) {
  .reward-access-card__code {
    width: 100%;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 4. Quest Card Enhancements */
.available-quests {
  margin-top: 3rem;
}

.quest-card {
  border-radius: 1.25rem;
  border: 1px solid rgba(167, 139, 250, 0.18);
  background: linear-gradient(180deg, #ffffff 0%, #fbfaff 100%);
  box-shadow: 0 12px 30px rgba(96, 75, 200, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  overflow: hidden;
}

.quest-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 34px rgba(96, 75, 200, 0.12);
}

.quest-card .card-body {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.25rem;
  color: #0f1724;
}

.quest-card__content {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  width: 100%;
  min-height: 140px;
}

.quest-card__badge {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
  box-shadow: 0 10px 22px rgba(96, 75, 200, 0.2);
  background: linear-gradient(135deg, var(--primary-1), var(--primary-2));
}

.quest-card__badge svg,
.quest-card__badge i {
  font-size: 1.5rem;
}

.quest-card__description {
  max-width: 320px;
  line-height: 1.6;
  margin-bottom: 0;
}

.quest-card__points {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.45rem 1rem;
  border-radius: 999px;
  background: rgba(129, 140, 248, 0.16);
  color: #4c1d95;
  font-weight: 600;
  border: 1px solid rgba(129, 140, 248, 0.24);
  box-shadow: 0 8px 18px rgba(79, 70, 229, 0.12);
}

.quest-card__actions {
  margin-top: auto;
  width: 100%;
}

.quest-card.quest-music .quest-card__badge {
  background: linear-gradient(135deg, #34d399, #10b981);
}

.quest-card.quest-trivia .quest-card__badge {
  background: linear-gradient(135deg, #60a5fa, #a855f7);
}



.quest-card__actions .start-quest-button {
  width: 100%;
}

/* 5. Reward Modal */
.reward-modal__dialog {
  max-width: 440px;
}

.modal-content.reward-modal {
  border: 1px solid rgba(167, 139, 250, 0.25);
  border-radius: var(--card-radius, 1rem);
  background: #ffffff;
  box-shadow: 0 28px 55px rgba(79, 70, 229, 0.22);
}

/* Animate the trophy icon */
.animate-tada {
  animation: tada 1s ease;
}

.modal-reward-header {
  padding: 2.5rem 1.5rem 2rem;
  background: linear-gradient(135deg, #a78bfa, #60a5fa);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.modal-reward-header::after {
  content: '';
  position: absolute;
  inset: 12% 18% auto;
  height: 160px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, transparent 70%);
  filter: blur(20px);
  opacity: 0.8;
  pointer-events: none;
}

.reward-modal__icon {
  position: relative;
  z-index: 1;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.18);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.25);
  backdrop-filter: blur(4px);
}

.reward-modal__icon-graphic {
  font-size: 2.5rem;
  color: #fff;
}

.reward-modal__subtitle {
  position: relative;
  z-index: 1;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
}

.reward-modal__content {
  padding: 2.75rem clamp(2rem, 5vw, 2.75rem) 2.5rem;
  background: linear-gradient(180deg, #ffffff 0%, #f7f5ff 100%);
}

.reward-modal__code {
  display: inline-block;
  padding: 1rem 2.5rem;
  border-radius: 1rem;
  font-weight: 700;
  font-size: clamp(2rem, 6vw, 2.75rem);
  letter-spacing: 0.2em;
  background: rgba(167, 139, 250, 0.18);
  color: #4c1d95;
  border: 2px dashed rgba(167, 139, 250, 0.45);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45), 0 12px 30px rgba(129, 140, 248, 0.18);
}

.reward-modal__cta {
  width: 100%;
  font-weight: 600;
  box-shadow: 0 16px 32px rgba(96, 165, 250, 0.35);
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
  /* match the soft gradient used across profile/home */
  background: radial-gradient(circle at 50% 50%, rgba(167, 139, 250, 0.18), rgba(255, 255, 255, 0));
  opacity: 0.8;
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
  .event-details-page::before,
  .event-details-page::after {
    display: none;
  }
  .progress-summary-card__content {
    padding: 1.1rem 1.25rem;
  }
  .points-progress {
    flex-direction: column;
    text-align: center;
    padding: 1rem 1.25rem;
    gap: 1.25rem;
  }
  .points-progress__meta {
    text-align: center;
  }
  .points-progress__track {
    width: 100%;
  }
  .quest-progress-card {
    width: 100%;
    align-items: center;
    text-align: center;
    flex: 1 1 auto;
  }
  .quest-progress-card__status {
    align-self: center;
  }
  .reward-access-card {
    padding: 1.3rem;
  }
  .quest-card__badge {
    width: 60px;
    height: 60px;
  }
  .available-quests {
    margin-top: 2rem;
  }
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
  /* Turn off sticky on tablets/phones to avoid overlap glitches */
  .progress-card.position-sticky { position: static !important; top: auto !important; }
}

@media (max-width: 767.98px) {
  .event-banner { padding: 3rem 0; min-height: 280px; }

  .quest-card .card-body { gap: 1rem; }
  .quest-card__description { max-width: none; }
}

@media (max-width: 575.98px) {
  .quest-card__content {
    min-height: 0;
    gap: 1rem;
  }

  .main-content-wrapper { margin-top: 1.25rem; }
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
.score-number { font-size: 1.75rem; line-height: 1; }

/* Score ring responsive sizing */
@media (max-width: 767.98px) {
  .score-ring { width: 110px; height: 110px; }
  .score-number { font-size: 1.5rem; }
}
.date-range-chip {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  padding: .5rem .75rem;
  border-radius: 999px;
  background: rgba(255,255,255,.18);
  color: #fff;
  border: 1px solid rgba(255,255,255,.35);
  backdrop-filter: blur(4px);
  font-size: .9rem;
}
.chip--clickable {
  cursor: pointer;
  text-decoration: none;
}
.chip--clickable:hover {
  filter: brightness(1.03);
}
/* Map popover styles must be global since Bootstrap appends to body */
:global(.map-popover) {
  z-index: 2000 !important;
  max-width: 520px;
  border: 0;
  background: transparent;
}
:global(.map-popover .popover-arrow) { display: none; }
:global(.map-popover .popover-body) { padding: 0; }

:global(.map-popover .map-popover-card) {
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.94)) padding-box,
    linear-gradient(120deg, rgba(167,139,250,0.6), rgba(96,165,250,0.5)) border-box;
  border: 2px solid transparent;
  box-shadow: 0 18px 40px rgba(16,24,40,0.22), 0 6px 18px rgba(79,70,229,0.16);
  overflow: hidden;
}
:global(.map-popover .map-popover-media) {
  position: relative;
}
:global(.map-popover .map-popover-img),
:global(.map-popover .map-popover-embed) {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16/9;
  border: 0;
}
:global(.map-popover .map-popover-embed) {
  pointer-events: none;
}
:global(.map-popover .map-popover-chip) {
  position: absolute;
  left: 10px;
  bottom: 10px;
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  padding: .35rem .6rem;
  font-size: .8rem;
  border-radius: 999px;
  background: rgba(17,24,39,0.65);
  color: #fff;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255,255,255,0.35);
}
:global(.map-popover .map-popover-actions) {
  padding: .6rem .75rem .8rem;
  display: flex;
  justify-content: flex-end;
}

/* Neutralize default embed when Cloud Map ID isn't set */
.map-embed--neutral {
  filter: saturate(0.9) contrast(1.06) brightness(1.02);
}

/* Modal map beautification */
.map-embed-wrapper {
  position: relative;
  aspect-ratio: 16/9;
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.94)) padding-box,
    linear-gradient(120deg, rgba(167,139,250,0.6), rgba(96,165,250,0.5)) border-box;
  border: 2px solid transparent;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(16,24,40,0.18), 0 6px 18px rgba(79,70,229,0.12);
}
.map-embed-wrapper iframe {
  width: 100%;
  height: 100%;
  display: block;
}
.map-overlay-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: .5rem;
  z-index: 5;
}
@media (max-width: 575.98px) {
  .map-embed-wrapper { aspect-ratio: 4/3; }
  .map-overlay-controls { top: 8px; right: 8px; }
}
</style>

<style>
@keyframes float-and-fade {
    0% {
        opacity: 1;
        transform: translate(calc(-50% + var(--translate-x, 0)), -50%) scale(1);
    }
    100% {
        opacity: 0;
        transform: translate(calc(-50% + var(--translate-x, 0)), -70px) scale(0.5);
    }
}
</style>



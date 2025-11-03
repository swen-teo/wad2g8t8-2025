<template>
  <div class="container py-5">
    <Loading :is-loading="userStore.loading" />

    <template v-if="!userStore.loading">
      <!-- user profile header card -->
      <div
        v-if="userStore.currentUser"
        class="card shadow-sm border-0 mb-5 profile-header-card"
      >
      <div class="card-body p-4 p-md-5">
        <div class="row align-items-center">
          <div class="col-12 col-md-3 text-center mb-3 mb-md-0">
            <div class="avatar-wrap d-inline-block">
              <img
                :src="userStore.currentUser.avatar || 'https://placehold.co/150/a78bfa/ffffff?text=User'"
                class="img-fluid rounded-circle profile-avatar shadow-sm"
                alt="Profile Avatar"
              />
              <!-- tier pill: shows tier name and color, nicer than a single dot -->
              <div
                v-if="userStore.currentUser.currentTier"
                class="tier-pill d-inline-flex align-items-center justify-content-center"
                :style="{ backgroundColor: userStore.currentTier.bg, color: userStore.currentTier.color, borderColor: userStore.currentTier.color }"
                :title="userStore.currentUser.currentTier + ' tier'"
              >
                <small class="fw-semibold">{{ userStore.currentUser.currentTier }}</small>
              </div>
            </div>
          </div>
          <div class="col-md-9">
            <div
              class="d-flex justify-content-between align-items-start"
            >
              <div>
                <h1 class="fw-bold mb-0">
                  {{ userStore.currentUser.name }}
                </h1>
                <p class="text-muted mb-2">
                  {{ userStore.currentUser.email }}
                </p>
                <div class="d-flex align-items-center gap-2"><span
                  class="badge fs-6"
                  :style="{ 
                    backgroundColor: userStore.currentTier.bg, 
                    color: userStore.currentTier.color 
                  }"
                >
                  <i class="fas fa-shield-alt me-1"></i>
                  {{ userStore.currentUser.currentTier }} Tier
                </span>
                <div
                class="tier-info-icon"
                data-bs-toggle="popover"
                data-bs-trigger="hover focus" 
                data-bs-placement="right" 
                data-bs-title="Tier Information"
    
                data-bs-html="true" data-bs-content="
                  <strong>Bronze:</strong> Levels 1–10<br>
                  <strong>Silver:</strong> Levels 11–20<br>
                  <strong>Gold:</strong> Levels 21–30<br>
                  <strong>Platinum:</strong> Levels 31+" 
                  
                style="cursor: pointer;">

              <font-awesome-icon 
                :icon="['fas','info-circle']" 
                :style="{ color: userStore.currentTier.color }" 
              />
            </div>
                </div>
              </div>
              <button
                  class="btn btn-outline-secondary btn-sm"
                  @click="handleLogout"
                >
                  Logout
                </button>
            </div>
            <hr class="my-4" />
            <div class="row gx-3">
              <div class="col-12 col-md-4 mb-3 mb-md-0 d-flex flex-column align-items-center align-items-md-start">
                <h5 class="text-muted small text-uppercase mb-1 d-flex align-items-center justify-content-center justify-content-md-start">
                  <font-awesome-icon :icon="['fas','star']" class="me-2 text-warning" />
                  Total Points
                </h5>
                <h3 class="fw-bold mb-0 d-flex align-items-center gap-2 justify-content-center justify-content-md-start w-100">
                  <span class="stat-pill">{{ userStore.currentUser.totalPoints }}</span>
                </h3>
              </div>
              <div class="col-12 col-md-4 mb-3 mb-md-0 d-flex flex-column align-items-center align-items-md-start">
                <h5 class="text-muted small text-uppercase mb-1 d-flex align-items-center justify-content-center justify-content-md-start">
                  <font-awesome-icon :icon="['fas','shield-alt']" class="me-2 text-primary-2" />
                  Level
                </h5>
                <h3 class="fw-bold mb-0 d-flex align-items-center gap-2 justify-content-center justify-content-md-start w-100">
                  <span class="stat-pill">{{ userStore.currentUser.level }}</span>
                </h3>
              </div>
              <div class="col-12 col-md-4 d-flex flex-column align-items-center align-items-md-start">
                <h5 class="text-muted small text-uppercase mb-1 d-flex align-items-center justify-content-center justify-content-md-start">
                  <font-awesome-icon :icon="['fas','flag-checkered']" class="me-2 text-success" />
                  Events Unlocked
                </h5>
                <h3 class="fw-bold mb-0 d-flex align-items-center gap-2 justify-content-center justify-content-md-start w-100">
                  <span class="stat-pill">{{ unlockedEvents.length }}</span>
                </h3>
              </div>
            </div>
            <div class="mt-4">
              <div class="d-flex justify-content-between align-items-center mb-2">
                      <h5 class="text-muted small text-uppercase d-flex align-items-center gap-2">
                        <font-awesome-icon :icon="['fas','tachometer-alt']" class="me-1 text-muted" />
                        Progress to next level
                      </h5>
                      <div class="small text-muted fw-semibold">{{ userStore.levelProgress }}%</div>
                    </div>
              <div class="progress profile-progress">
                <div
                  class="progress-bar"
                  role="progressbar"
                  :style="{ width: userStore.levelProgress + '%' }"
                  :aria-valuenow="userStore.levelProgress"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <!-- main content: badges and quests -->
      <div
        v-if="userStore.isLoggedIn"
        class="row g-5"
      >
      <!-- left column: badges -->
      <div class="col-lg-4">
        <h4 class="mb-3">My Badges</h4>
        <div
          v-if="userStore.currentUser.badges?.length > 0"
          class="card card-body"
        >
          <div class="list-group list-group-flush">
              <div
                v-for="badge in userStore.currentUser.badges"
                :key="badge"
                class="list-group-item d-flex align-items-center"
              >
                <div class="badge-icon me-3">
                  <font-awesome-icon :icon="['fas','trophy']" class="text-white" />
                </div>
                <span class="fw-bold">{{ badge }}</span>
              </div>
          </div>
        </div>
        <p
          v-else
          class="text-muted"
        >
          No badges earned yet. Go complete some quests!
        </p>
      </div>

      <!-- right column: completed quests -->
      <div class="col-lg-8">
        <h4 class="mb-3">Events Unlocked</h4>
        <div class="card events-card">
          <div class="card-body p-0">
            <div class="events-card-header d-flex align-items-center justify-content-between p-3 p-md-4">
              <div class="d-flex align-items-center gap-2">
                <div class="events-badge-icon">
                  <font-awesome-icon :icon="['fas','flag-checkered']" />
                </div>
                <h5 class="mb-0">Unlocked Events</h5>
              </div>
              <span class="events-count badge rounded-pill">
                {{ unlockedEvents.length }}
              </span>
            </div>

            <!-- Loading state -->
            <div v-if="isLoadingEvents" class="text-center py-4">
              <span class="spinner-border" role="status" aria-hidden="true"></span>
            </div>

            <!-- List state -->
            <ul v-else-if="unlockedEvents.length > 0" class="list-group list-group-flush">
              <li
                v-for="event in unlockedEvents"
                :key="event.id"
                class="list-group-item event-item"
                role="button"
                tabindex="0"
                @click="goToEvent(event.id)"
                @keyup.enter="goToEvent(event.id)"
                @keyup.space.prevent="goToEvent(event.id)"
              >
                <div class="d-flex align-items-center justify-content-between w-100">
                  <div class="d-flex align-items-center gap-3">
                    <div class="event-icon">
                      <font-awesome-icon :icon="['fas','check']" />
                    </div>
                    <div class="event-text">
                      <div class="event-title">{{ event.title }}</div>
                      <div class="event-meta" v-if="event.subtitle || event.unlockedAtLabel">
                        <span v-if="event.subtitle">{{ event.subtitle }}</span>
                        <span v-if="event.subtitle && event.unlockedAtLabel" class="mx-2">•</span>
                        <span v-if="event.unlockedAtLabel">Unlocked {{ event.unlockedAtLabel }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="chevron" aria-hidden="true">
                    <font-awesome-icon :icon="['fas','angle-right']" />
                  </div>
                </div>
              </li>
            </ul>

            <!-- Empty state -->
            <div v-else class="p-4 text-center text-muted">
              <div class="mb-2">
                <div class="event-icon mx-auto">
                  <font-awesome-icon :icon="['fas','lock']" />
                </div>
              </div>
              <p class="mb-0">No events unlocked yet. Complete quests to reveal your next adventure.</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { Popover } from 'bootstrap';
import { useUserStore } from '@/store/user.js';
import { db } from '@/firebase.js';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import Loading from '@/components/Loading.vue';

// get our user data from the store
const userStore = useUserStore();
const router = useRouter();

// local state for this page
const unlockedEvents = ref([]);
const isLoadingEvents = ref(false);

function asDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateLabel(date) {
  if (!date) return null;
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    console.warn('Unable to format date label', error);
    return null;
  }
}

// fetches the list of events this user has unlocked by completing all quests
async function loadUnlockedEvents(userId) {
  if (!userId) return; // can't fetch if we don't know who the user is

  isLoadingEvents.value = true;
  unlockedEvents.value = [];
  try {
    const q = query(
      collection(db, 'users', userId, 'eventProgress'),
      where('rewardClaimed', '==', true)
    );
    const querySnapshot = await getDocs(q);

    const events = await Promise.all(
      querySnapshot.docs.map(async (snapshot) => {
        const progress = snapshot.data();
        const eventId = snapshot.id;

        const unlockedAt =
          asDate(progress.rewardClaimedAt) || asDate(progress.lastUpdated);

        let eventDetails;
        try {
          const eventDoc = await getDoc(doc(db, 'events', eventId));
          if (eventDoc.exists()) {
            eventDetails = eventDoc.data();
          }
        } catch (eventError) {
          console.warn('Unable to load event details', eventId, eventError);
        }

        const title =
          eventDetails?.title ||
          progress.eventTitle ||
          `Unlocked Event ${eventId}`;

        const venueName =
          eventDetails?.venueName || progress.eventVenueName || null;
        const venueCity =
          eventDetails?.venueCity || progress.eventVenueCity || null;

        const subtitleParts = [];
        if (eventDetails?.date || progress.eventDate) {
          subtitleParts.push(eventDetails?.date || progress.eventDate);
        }
        const venueText = [venueName, venueCity]
          .filter(Boolean)
          .join(', ');
        if (venueText) {
          subtitleParts.push(venueText);
        }

        return {
          id: eventId,
          title,
          subtitle: subtitleParts.join(' • ') || null,
          unlockedAt,
          unlockedAtLabel: formatDateLabel(unlockedAt),
        };
      })
    );

    unlockedEvents.value = events
      .filter(Boolean)
      .sort((a, b) => {
        const aTime = a.unlockedAt ? a.unlockedAt.getTime() : 0;
        const bTime = b.unlockedAt ? b.unlockedAt.getTime() : 0;
        return bTime - aTime;
      })
      .map(({ unlockedAt, ...rest }) => rest);
  } catch (error) {
    console.error('Error fetching unlocked events:', error);
  } finally {
    isLoadingEvents.value = false;
  }
}

onMounted(() => {
    // Find all elements marked as a popover and initialize them
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');

    // Initialize popovers
    [...popoverTriggerList].map(popoverTriggerEl => new Popover(popoverTriggerEl));
});

// 'watch' for the userStore to finish loading the user
// a watcher is like a little spy that runs a function
// when a specific piece of data changes.
watch(
  () => userStore.currentUser, // the data to watch
  (newUser) => {
    // the function to run when it changes
    if (newUser) {
      loadUnlockedEvents(newUser.uid);
    } else {
      unlockedEvents.value = [];
    }
  },
  { immediate: true } // run this immediately on load, just in case
);

// wrapper so we logout from firebase/store and then route to Login page
async function handleLogout() {
  await userStore.logout();
  router.push({ name: 'Login' });
}

// navigate to an event's details page
function goToEvent(id) {
  if (!id) return;
  router.push({ name: 'EventDetails', params: { id } });
}
</script>

<style scoped>
.profile-header-card {
  border-radius: 1.5rem;
  background-color: #ffffff;
}

.profile-avatar {
  width: 150px;
  height: 150px;
  max-width: 150px;
  object-fit: cover;
  aspect-ratio: 1 / 1;
  display: block; /* avoid inline image layout differences */
}

/* Avatar wrapper allows decorative halo and positioned tier pill */
.avatar-wrap { position: relative; display: inline-block; }
.avatar-wrap::after {
  /* subtle halo ring */
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 20%, rgba(167,139,250,0.12), transparent 30%);
  filter: blur(8px);
  opacity: 0.9;
  z-index: 0;
}
.avatar-wrap .profile-avatar { position: relative; z-index: 1; }

.tier-pill {
  position: absolute;
  right: -6px;
  bottom: -6px;
  padding: .25rem .5rem;
  border-radius: 999px;
  border: 2px solid rgba(255,255,255,0.9);
  box-shadow: 0 6px 18px rgba(96,75,200,0.12);
  font-size: .7rem;
  transform: translate(20%, 20%);
  z-index: 2;
}

.progress-bar {
  background-color: var(--primary-1);
  transition: width 0.5s ease-in-out;
}

/* Make the profile page progress bar thicker and vertically centered */
.profile-progress {
  height: 36px; /* thicker */
  border-radius: 12px;
  overflow: hidden; /* keep inner bar rounded */
}
.profile-progress .progress-bar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #fff;
  border-radius: 12px; /* match container */
}

/* Make the header card look more premium */
.profile-header-card {
  background: linear-gradient(180deg, #ffffff 0%, #fbfaff 100%);
  border: 1px solid rgba(0,0,0,0.04);
}

.stat-pill {
  background: linear-gradient(90deg, rgba(167,139,250,0.12), rgba(96,165,250,0.08));
  padding: .25rem .6rem;
  border-radius: 999px;
  font-size: 1rem;
}

.badge-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--primary-1), var(--primary-2));
  display: inline-grid;
  place-items: center;
}
.badge-icon .svg-inline--fa { width: 20px; height: 20px; }

.quest-icon {
  width: 40px;
  height: 40px;
}

.list-group-item { display: flex; align-items: center; }
.list-group-item + .list-group-item { border-top: 1px solid #f1eefb; }


/* Wrapper that holds the bar and the label */
.profile-progress-wrapper {
  gap: .75rem;
}
.progress-label {
  min-width: 140px;
  text-align: right;
  color: var(--ink-muted);
}

/* Responsive: on very small screens stack the label below the bar */
@media (max-width: 575.98px) {
  .profile-progress-wrapper {
    flex-direction: column;
    align-items: stretch;
  }
  .progress-label {
    text-align: left;
    min-width: 0;
  }
}

/* Responsive adjustments specific to profile page */
@media (max-width: 575.98px) {
  .profile-avatar {
    width: 96px;
    height: 96px;
    max-width: 96px;
    aspect-ratio: 1 / 1;
    margin: 0 auto;
  }
  .profile-header-card .card-body {
    padding: 1.25rem;
  }
  .profile-header-card h1 { font-size: 1.25rem; }
  /* Make the small stat pills expand and center on very small screens */
  .stat-pill {
    display: block;
    width: 100%;
    text-align: center;
    padding: .5rem 0;
    font-size: 1.05rem;
    border-radius: 12px;
  }
}

/* Spacing tweaks for badges and lists */
.list-group-item { padding-top: .75rem; padding-bottom: .75rem; }
.card.card-body { padding: 1rem; }


.tier-info-icon {
    width: 28px; 
    height: 28px;
    border-radius: 50%; 
    background-color: #e9ecef;
    /* color: var(--bs-secondary); */
    display: inline-flex; 
    align-items: center; 
    justify-content: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    font-size: 0.85rem; 
    flex-shrink: 0; 
}

.tier-info-icon:hover {
    background-color: var(--primary-1); 
    color: white; 
}

/* Events card styling */
.events-card {
  border: 1px solid rgba(0,0,0,0.04);
  border-radius: 1rem;
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff 0%, #fbfaff 100%);
  box-shadow: 0 6px 18px rgba(96,75,200,0.06);
}
.events-card-header {
  background: linear-gradient(90deg, rgba(167,139,250,0.08), rgba(96,165,250,0.06));
  border-bottom: 1px solid #f1eefb;
}
.events-badge-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: inline-grid;
  place-items: center;
  color: #fff;
  background: linear-gradient(135deg, var(--primary-1), var(--primary-2));
  box-shadow: 0 6px 14px rgba(96,75,200,0.18);
}
.events-count {
  background: rgba(167,139,250,0.15);
  color: var(--primary-1);
  font-weight: 600;
  padding: .5rem .75rem;
}

/* Event list items */
.event-item {
  border-color: #f1eefb;
  transition: background-color .2s ease, transform .15s ease;
  cursor: pointer;
}
.event-item:hover {
  background: linear-gradient(90deg, rgba(167,139,250,0.06), rgba(96,165,250,0.04));
}
.event-item:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(167,139,250,0.35);
}
.event-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: inline-grid;
  place-items: center;
  color: #22c55e;
  background: #f0fdf4;
  border: 1px solid #dcfce7;
}
.event-text .event-title {
  font-weight: 600;
}
.event-text .event-meta {
  color: #6c757d;
  font-size: .9rem;
}
.chevron { color: var(--primary-1); opacity: .7; }
.event-item:hover .chevron { opacity: 1; }
</style>



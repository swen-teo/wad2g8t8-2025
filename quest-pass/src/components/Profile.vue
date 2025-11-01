<template>
  <div class="container py-5">
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
                <span
                  class="badge fs-6"
                  :style="{ 
                    backgroundColor: userStore.currentTier.bg, 
                    color: userStore.currentTier.color 
                  }"
                >
                  <i class="fas fa-shield-alt me-1"></i>
                  {{ userStore.currentUser.currentTier }} Tier
                </span>
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

    <!-- loading state -->
    <div
      v-else-if="!userStore.authReady"
      class="text-center py-5"
    >
      <div
        class="spinner-border text-primary-1"
        role="status"
        style="width: 3rem; height: 3rem"
      >
        <span class="visually-hidden">Loading profile...</span>
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
        <div
          v-if="isLoadingEvents"
          class="text-center"
        >
          <span
            class="spinner-border spinner-border-sm"
            role="status"
          ></span>
        </div>
        <ul v-else-if="unlockedEvents.length > 0" class="list-group">
          <li
            v-for="event in unlockedEvents"
            :key="event.id"
            class="list-group-item"
          >
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-3">
                <div class="quest-icon bg-light rounded-circle d-inline-flex align-items-center justify-content-center">
                  <font-awesome-icon :icon="['fas','check']" class="text-success" />
                </div>
                <div>
                  <strong>{{ event.title }}</strong>
                  <div v-if="event.subtitle" class="text-muted small">{{ event.subtitle }}</div>
                  <div v-if="event.unlockedAtLabel" class="text-muted small">Unlocked {{ event.unlockedAtLabel }}</div>
                </div>
              </div>
              <div class="text-success">
                <font-awesome-icon :icon="['fas','angle-right']" />
              </div>
            </div>
          </li>
        </ul>
        <p
          v-else
          class="text-muted"
        >
          No events unlocked yet.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useUserStore } from '@/store/user.js';
import { db } from '@/firebase.js';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useRouter } from 'vue-router';

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

</style>



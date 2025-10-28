<template>
  <div class="container py-5">
    <!-- user profile header card -->
    <div
      v-if="userStore.currentUser"
      class="card shadow-sm border-0 mb-5 profile-header-card"
    >
      <div class="card-body p-4 p-md-5">
        <div class="row align-items-center">
          <div class="col-md-3 text-center mb-4 mb-md-0">
            <img
              :src="userStore.currentUser.avatar || 'https://placehold.co/150/a78bfa/ffffff?text=User'"
              class="img-fluid rounded-circle"
              alt="Profile Avatar"
              style="width: 150px; height: 150px; object-fit: cover"
            />
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
                @click="userStore.logout"
              >
                Logout
              </button>
            </div>
            <hr class="my-4" />
            <div class="row text-center">
              <div class="col-4">
                <h5 class="text-muted small text-uppercase">
                  Total Points
                </h5>
                <h3 class="fw-bold">
                  {{ userStore.currentUser.totalPoints }}
                </h3>
              </div>
              <div class="col-4">
                <h5 class="text-muted small text-uppercase">
                  Level
                </h5>
                <h3 class="fw-bold">
                  {{ userStore.currentUser.level }}
                </h3>
              </div>
              <div class="col-4">
                <h5 class="text-muted small text-uppercase">
                  Quests Done
                </h5>
                <h3 class="fw-bold">
                  {{ completedQuests.length }}
                </h3>
              </div>
            </div>
            <div class="progress mt-4" style="height: 20px">
              <div
                class="progress-bar"
                role="progressbar"
                :style="{ width: userStore.levelProgress + '%' }"
                :aria-valuenow="userStore.levelProgress"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {{ userStore.levelProgress }}% to next level
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
              <i
                class="fas fa-trophy fa-2x me-3"
                style="color: var(--primary-1)"
              ></i>
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
        <h4 class="mb-3">Recent Quest Completions</h4>
        <div
          v-if="isLoadingQuests"
          class="text-center"
        >
          <span
            class="spinner-border spinner-border-sm"
            role="status"
          ></span>
        </div>
        <ul
          v-else-if="completedQuests.length > 0"
          class="list-group"
        >
          <li
            class="list-group-item d-flex justify-content-between align-items-center"
            v-for="quest in completedQuests"
            :key="quest.id"
          >
            <div>
              <strong>{{ quest.title }}</strong>
              <p class="mb-0 text-muted small">
                +{{ quest.points }} XP
              </p>
            </div>
            <i class="fas fa-check-circle text-success"></i>
          </li>
        </ul>
        <p
          v-else
          class="text-muted"
        >
          No quests completed yet.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useUserStore } from '@/store/user.js';
import { db } from '@/firebase.js';
import { collection, getDocs, query, where } from 'firebase/firestore';

// get our user data from the store
const userStore = useUserStore();

// local state for this page
const completedQuests = ref([]);
const isLoadingQuests = ref(false);

// fetches the list of quests this user has completed
async function loadCompletedQuests(userId) {
  if (!userId) return; // can't fetch if we don't know who the user is

  isLoadingQuests.value = true;
  completedQuests.value = [];
  try {
    //
    // this query looks for documents in a "completedQuests" collection
    // where the 'userId' field matches our logged-in user's id.
    //
    const q = query(
      collection(db, 'completedQuests'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);

    const quests = [];
    querySnapshot.forEach((doc) => {
      quests.push({ id: doc.id, ...doc.data() });
    });
    // sort by date, newest first (optional)
    quests.sort((a, b) => b.completedAt - a.completedAt);
    completedQuests.value = quests;
  } catch (error) {
    console.error('Error fetching completed quests:', error);
  }
  isLoadingQuests.value = false;
}

// 'watch' for the userStore to finish loading the user
// a watcher is like a little spy that runs a function
// when a specific piece of data changes.
watch(
  () => userStore.currentUser, // the data to watch
  (newUser) => {
    // the function to run when it changes
    if (newUser) {
      loadCompletedQuests(newUser.uid);
    }
  },
  { immediate: true } // run this immediately on load, just in case
);
</script>

<style scoped>
.profile-header-card {
  border-radius: 1.5rem;
  background-color: #ffffff;
}

.progress-bar {
  background-color: var(--primary-1);
  transition: width 0.5s ease-in-out;
}
</style>

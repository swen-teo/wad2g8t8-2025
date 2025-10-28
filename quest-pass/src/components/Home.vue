<template>
  <main class="container py-5">
    <header class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="mb-0">Upcoming Events</h1>
      <div class="col-md-4">
        <input
          type="search"
          class="form-control"
          placeholder="Search events..."
          v-model="searchQuery"
          @keyup.enter="filterEvents"
        />
      </div>
    </header>

    <section>
      <div class="row g-4">
        <div
          v-for="event in upcomingEvents"
          :key="event.id"
          class="col-md-6 col-lg-4"
        >
          <router-link
            :to="'/event/' + event.id"
            class="text-decoration-none text-dark"
          >
            <div class="card h-100 event-card shadow-sm">
              <img
                :src="event.image"
                class="card-img-top"
                :alt="event.title"
              />
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">{{ event.title }}</h5>
                <p class="card-text text-muted small">
                  <i class="fas fa-calendar-alt me-2"></i
                  >{{ event.date }}
                </p>
                <p class="card-text flex-grow-1">{{ event.description }}</p>
                <div class="mt-auto pt-2 border-top">
                  <button class="btn btn-primary w-100">
                    View Details & Start Quests &rarr;
                  </button>
                </div>
              </div>
            </div>
          </router-link>
        </div>

        <div
          v-if="upcomingEvents.length === 0"
          class="col-12"
        >
          <p class="text-muted text-center py-5">
            No upcoming events match your search. Check back later!
          </p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// --- State ---
// These replace the data() properties from app.js
const searchQuery = ref('');
const allEvents = ref([]);
const upcomingEvents = ref([]);

// --- Methods ---
// These replace the methods: {} from app.js

/**
 * Filters the events shown on the page based on the search query.
 */
function filterEvents() {
  if (!searchQuery.value) {
    upcomingEvents.value = allEvents.value;
    return;
  }
  const lowerQuery = searchQuery.value.toLowerCase();
  upcomingEvents.value = allEvents.value.filter(
    (event) =>
      event.title.toLowerCase().includes(lowerQuery) ||
      event.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 need to update to collect from event api
**/
function loadEvents() {
  const mockEventData = [
    {
      id: 1,
      title: 'CSS Summit 2025',
      description: 'An elite gathering of front-end warriors.',
      date: 'Nov 12, 2025',
      image: 'https://via.placeholder.com/400x200?text=CSS+Summit',
    },
    {
      id: 2,
      title: 'JavaScript Gauntlet',
      description: 'Face JS challenges to level up.',
      date: 'Dec 3, 2025',
      image: 'https://via.placeholder.com/400x200?text=JS+Gauntlet',
    },
  ];

  allEvents.value = mockEventData;
  upcomingEvents.value = mockEventData;
}

// --- lifecycle ---
onMounted(() => {
  loadEvents();
});
</script>

<style scoped>
.event-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1) !important;
}
</style>
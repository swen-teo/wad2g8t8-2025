<template>
  <main class="container py-5">
    <!-- header and search bar -->
    <header class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="mb-0">Upcoming Events</h1>
      <div class="col-md-4">
        <input
          type="search"
          class="form-control"
          placeholder="Search events..."
          v-model="searchQuery"
        />
      </div>
    </header>

    <!-- loading spinner -->
    <div
      v-if="isLoading"
      class="text-center py-5"
    >
      <div
        class="spinner-border text-primary-1"
        role="status"
        style="width: 3rem; height: 3rem"
      >
        <span class="visually-hidden">Loading events...</span>
      </div>
      <p class="mt-3 text-muted">Loading events...</p>
    </div>

    <!-- event grid -->
    <section v-else>
      <div class="row g-4">
        <div
          v-for="event in filteredEvents"
          :key="event.id"
          class="col-md-6 col-lg-4"
        >
          <!--
            this <router-link> is the vue-way of doing <a> tags.
            it'll navigate to the eventdetails page without a full page reload.
          -->
          <!-- If event.id is present make the card a router-link, otherwise render a non-clickable div
               This prevents Vue Router from throwing "Missing required param 'id'" when id is undefined. -->
          <router-link
            v-if="event.id"
            :to="{ name: 'EventDetails', params: { id: event.id } }"
            class="text-decoration-none text-dark"
          >
            <div class="card h-100 event-card shadow-sm border-0">
              <img
                :src="event.image"
                class="card-img-top"
                alt="Event Image"
                @error="onImageError"
              />
              <div class="card-body d-flex flex-column">
                <h5 class="card-title fw-bold">{{ event.title }}</h5>
                <p class="card-text text-muted small flex-grow-1">
                  {{ event.date }}
                </p>
                <p class="card-text description-truncate">
                  {{ event.description }}
                </p>
              </div>
            </div>
          </router-link>

          <div v-else class="text-decoration-none text-dark">
            <div class="card h-100 event-card shadow-sm border-0">
              <img
                :src="event.image"
                class="card-img-top"
                alt="Event Image"
                @error="onImageError"
              />
              <div class="card-body d-flex flex-column">
                <h5 class="card-title fw-bold">{{ event.title }}</h5>
                <p class="card-text text-muted small flex-grow-1">
                  {{ event.date }}
                </p>
                <p class="card-text description-truncate">
                  {{ event.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- no events found message -->
      <div
        v-if="!isLoading && filteredEvents.length === 0"
        class="text-center py-5 text-muted"
      >
        <i
          class="fas fa-search fa-3x mb-3"
          aria-hidden="true"
        ></i>
        <h4 class="fw-bold">No Events Found</h4>
        <p>
          Try adjusting your search or check back later for new events.
        </p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
// Firebase imports are no longer needed here
// import { db } from '@/firebase.js';
// import { collection, getDocs } from 'firebase/firestore';

// page state
const searchQuery = ref('');
const allEvents = ref([]);
const isLoading = ref(true);

// Get your secure API key from environment variables
const apiKey = import.meta.env.VITE_JAMBASE_API_KEY;

// --- DEBUG LINE ---
// This will log "My API Key is: your_key_here" if it's working,
// or "My API Key is: undefined" if it's not.
console.log('My API Key is:', apiKey);
// --- END DEBUG LINE ---

// this computed property will automatically update
// whenever 'searchQuery' or 'allEvents' changes.
const filteredEvents = computed(() => {
  if (!searchQuery.value) {
    return allEvents.value;
  }
  const lowerQuery = searchQuery.value.toLowerCase();
  return allEvents.value.filter(
    (event) =>
      event.title.toLowerCase().includes(lowerQuery) ||
      event.description.toLowerCase().includes(lowerQuery)
  );
});

// this runs when the component is first loaded
onMounted(() => {
  loadEvents();
});

// fetches the list of events from the Jambase API
async function loadEvents() {
  isLoading.value = true;

  // --- NEW API KEY CHECK ---
  // This is the new, improved check. It will give you a clear
  // error in the console if the key is missing.
  if (!apiKey) {
    console.error('--- VITE_JAMBASE_API_KEY is missing! ---');
    console.error(
      'Please make sure you have a .env.local file in your root folder.'
    );
    console.error(
      'The file content should be: VITE_JAMBASE_API_KEY=your_key_here'
    );
    console.error('*** YOU MUST RESTART your server (npm run dev) ***');
    isLoading.value = false;
    return; // Stop the function here
  }
  // --- END NEW CHECK ---

  const jambaseApiUrl = `https://www.jambase.com/jb-api/v1/events?apikey=${apiKey}&geoCountryIso2=SG`;

  try {
    const response = await fetch(jambaseApiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // THIS IS THE DATA MAPPING
    // We transform the Jambase API response (data.events)
    // into the structure our template expects.
    const eventsFromApi = data.events.map((apiEvent) => {
      // Format the date to be more readable
      const eventDate = new Date(apiEvent.startDate).toLocaleDateString(
        'en-US',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      );

      // --- FIX: Make data mapping safer ---
      // Check for missing venue or performer data using optional chaining (?.)
      // and provide fallback text ('??')

      const venueName = apiEvent.venue?.name ?? 'Venue TBA';
      const venueLocation =
        apiEvent.venue?.address?.addressLocality ?? 'Location TBA';
      const performerName = apiEvent.performer?.[0]?.name;

      return {
        id: apiEvent.id,
        title: apiEvent.name,
        // Use our new safe variables
        date: `${eventDate} at ${venueName}, ${venueLocation}`,
        description:
          apiEvent.description ||
          (performerName
            ? `See ${performerName} live!`
            : 'Check out this event!'), // Use a fallback description
        image: apiEvent.image ?? null, // Handle missing images
      };
    });

    allEvents.value = eventsFromApi;
  } catch (error) {
    console.error('Error fetching events from Jambase:', error);
    // here you could use your toast notification
  }
  isLoading.value = false;
}

// a little fallback for broken images
function onImageError(event) {
  event.target.src = 'https://placehold.co/400x200/a78bfa/ffffff?text=Event';
}
</script>

<style scoped>
/* styles from your original index.html */
.event-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  border-radius: 0.75rem; /* 12px */
  overflow: hidden;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.card-img-top {
  height: 200px;
  object-fit: cover;
}

/* new style to truncate long descriptions */
.description-truncate {
  /* Use the WebKit box model for multi-line truncation */
  display: -webkit-box;
  -webkit-line-clamp: 2; /* show 2 lines */
  /* standard (future) property for compatibility */
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>


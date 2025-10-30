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
      <div class="event-grid">
        <div
          v-for="event in filteredEvents"
          :key="event.id"
          class="event-grid-item"
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
            class="event-card-link"
          >
            <div class="card event-card shadow-sm border-0">
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

          <div v-else class="event-card-link">
            <div class="card event-card shadow-sm border-0">
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
      <div v-if="!isLoading && filteredEvents.length === 0" class="text-center py-5 text-muted">
        <i class="fas fa-search fa-3x mb-3" aria-hidden="true"></i>
        <h4 class="fw-bold">No Events Found</h4>
        <p>Try adjusting your search or check back later for new events.</p>
        <div class="mt-3">
          <button class="btn btn-outline-primary btn-lg">Refresh</button>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import FilterSelect from './FilterSelect.vue';
// Firebase imports are no longer needed here
// import { db } from '@/firebase.js';
// import { collection, getDocs } from 'firebase/firestore';

// page state
const searchQuery = ref('');
const selectedLocation = ref('all');
const selectedDateRange = ref('all');
const selectedGenre = ref('all');
const allEvents = ref([]);
const isLoading = ref(true);

const dateRangeOptions = [
  { value: 'all', label: 'Any time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
];

// Get your secure API key from environment variables
const apiKey = import.meta.env.VITE_JAMBASE_API_KEY;

// --- DEBUG LINE ---
// This will log "My API Key is: your_key_here" if it's working,
// or "My API Key is: undefined" if it's not.
console.log('My API Key is:', apiKey);
// --- END DEBUG LINE ---

// this computed property will automatically update
// whenever 'searchQuery' or 'allEvents' changes.
const locationNames = computed(() => {
  const uniqueLocations = new Set();
  const options = [];

  for (const event of allEvents.value) {
    const location = event.venueCity ?? 'Location TBA';
    if (!uniqueLocations.has(location)) {
      uniqueLocations.add(location);
      options.push(location);
    }
  }

  return options.sort((a, b) => a.localeCompare(b));
});

const locationFilterOptions = computed(() => [
  { value: 'all', label: 'All locations' },
  ...locationNames.value.map((location) => ({
    value: location,
    label: location,
  })),
]);

const genreNames = computed(() => {
  const uniqueGenres = new Set();

  for (const event of allEvents.value) {
    for (const genre of event.genres ?? []) {
      uniqueGenres.add(genre);
    }
  }

  return Array.from(uniqueGenres).sort((a, b) => a.localeCompare(b));
});

const genreFilterOptions = computed(() => [
  { value: 'all', label: 'All genres' },
  ...genreNames.value.map((genre) => ({
    value: genre,
    label: genre,
  })),
]);

const filteredEvents = computed(() => {
  const lowerQuery = searchQuery.value.trim().toLowerCase();

  return allEvents.value.filter((event) => {
    const matchesSearch =
      !lowerQuery ||
      [
        event.title,
        event.description,
        event.venueName,
        event.venueCity,
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(lowerQuery));

    const matchesLocation =
      selectedLocation.value === 'all' ||
      event.venueCity === selectedLocation.value;

    const matchesGenre =
      selectedGenre.value === 'all' ||
      (event.genres ?? []).includes(selectedGenre.value);

    const matchesDate = matchesDateRange(event.startDate);

    return matchesSearch && matchesLocation && matchesGenre && matchesDate;
  });
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

      const directGenres = apiEvent.genres ?? [];
      const performerGenres = (apiEvent.performer ?? [])
        .flatMap((performer) => performer.genres ?? [])
        .map((genre) => (typeof genre === 'string' ? genre : genre?.name))
        .filter(Boolean);

      const normalizedDirectGenres = directGenres
        .map((genre) => (typeof genre === 'string' ? genre : genre?.name))
        .filter(Boolean);

      const eventGenres = [...normalizedDirectGenres, ...performerGenres];

      const uniqueEventGenres = [...new Set(eventGenres)];

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
        startDate: apiEvent.startDate,
        venueName,
        venueCity: venueLocation,
        genres: uniqueEventGenres,
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

function matchesDateRange(startDate) {
  if (selectedDateRange.value === 'all') {
    return true;
  }

  if (!startDate) {
    return false;
  }

  const eventDate = new Date(startDate);

  if (Number.isNaN(eventDate.getTime())) {
    return false;
  }

  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  switch (selectedDateRange.value) {
    case 'today': {
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(todayStart.getDate() + 1);
      return eventDate >= todayStart && eventDate < tomorrowStart;
    }
    case 'week': {
      const weekAhead = new Date(todayStart);
      weekAhead.setDate(todayStart.getDate() + 7);
      return eventDate >= todayStart && eventDate < weekAhead;
    }
    case 'month': {
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return eventDate >= todayStart && eventDate < nextMonthStart;
    }
    default:
      return true;
  }
}
</script>

<style scoped>
/* styles from your original index.html */
.page-header {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.search-filter-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-wrapper .input-group-text {
  border-right: 0;
  background: #fff;
  color: var(--primary-1);
}

.search-wrapper .form-control {
  border-left: 0;
}

.search-wrapper .input-group {
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid var(--bs-border-color, #ced4da);
  background-color: #fff;
}

.search-wrapper .input-group-text,
.search-wrapper .form-control {
  height: 3rem;
  display: flex;
  align-items: center;
  border: 0;
  box-shadow: none;
}

.search-wrapper .input-group-text {
  border-radius: 0.75rem 0 0 0.75rem;
}

.search-wrapper .form-control {
  border-radius: 0 0.75rem 0.75rem 0;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .search-filter-group {
    flex-direction: row;
    align-items: flex-end;
  }

  .search-wrapper {
    flex: 1 1 auto;
  }

  .filter-bar {
    flex: 0 0 auto;
  }
}


.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.event-grid-item {
  height: 100%;
}

.event-card-link {
  display: block;
  height: 100%;
  color: inherit;
  text-decoration: none;
}

.event-card {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
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
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.event-card .card-body {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}

.event-card .description-truncate {
  margin-top: auto;
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

/* New decorative styles for Home cards */
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

/* small adjustments for small screens */
@media (max-width: 575.98px) {
  .card-img-top { height: 160px; }
}

/* reduce the size of the page header (Upcoming Events) slightly */
header h1 {
  font-size: 1.45rem; /* slightly smaller than before */
  font-weight: 600;
}
@media (max-width: 575.98px) {
  header h1 { font-size: 1.15rem; }
}
</style>


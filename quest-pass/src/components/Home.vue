<template>
  <main class="container py-5">
    <!-- header and search bar -->
    <header class="mb-4">
      <!-- 🎟️ Emoji removed -->
      <h1 class="mb-3">Upcoming Events</h1>
      <!-- Vinyl spinner picker above search + filters -->
      <EventPicker :events="filteredEvents" class="mb-3" />

      <!-- Spinner sits above search + filters row -->
      <Loading :is-loading="isLoading" class="mb-3" />

      <!-- Search + Show Filters on the same row (responsive) -->
      <div class="search-row d-flex flex-column flex-sm-row align-items-stretch gap-2">
        <div class="home-search flex-grow-1 px-0">
          <input
            type="search"
            class="form-control"
            placeholder="Search events..."
            v-model="searchQuery"
          />
        </div>
        <div class="filters-toggle flex-sm-grow-0">
          <button class="btn btn-outline-primary w-100" @click="toggleFilters">
            <font-awesome-icon :icon="['fas', showFilters ? 'times' : 'filter']" class="me-2" />
            {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
          </button>
        </div>
      </div>
    </header>

    <!-- 🎛 Collapsible filters -->
    <transition name="slide-fade">
      <div v-if="showFilters" class="filter-panel p-3 mb-4 rounded shadow-sm bg-light">
        <div class="row g-3">
          <!-- Venue -->
          <div class="col-md-4 col-sm-6">
            <label class="form-label small text-muted">Venue</label>
            <select class="form-select" v-model="selectedVenue">
              <option value="all">All venues</option>
              <option v-for="v in venueOptions" :key="v" :value="v">{{ v }}</option>
            </select>
          </div>

          <!-- Date from -->
          <div class="col-md-3 col-sm-6">
            <label class="form-label small text-muted">Date from</label>
            <input type="date" class="form-control" v-model="dateFrom" />
          </div>

          <!-- Date to -->
          <div class="col-md-3 col-sm-6">
            <label class="form-label small text-muted">Date to</label>
            <input type="date" class="form-control" v-model="dateTo" />
          </div>

          <!-- Quick range (reuses your existing selectedDateRange) -->
          <div class="col-md-2 col-sm-6">
            <label class="form-label small text-muted">Quick range</label>
            <select class="form-select" v-model="selectedDateRange">
              <option value="all">Any time</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
          </div>
        </div>

        <div class="mt-3">
          <button class="btn btn-outline-primary btn-sm rounded-3" @click="resetFilters">Reset filters</button>
        </div>
      </div>
    </transition>
    <!-- event discovery + grid -->
  <section v-if="!isLoading">

      <div class="event-grid">
  <div
    v-for="event in groupedEvents"
    :key="event.groupKey"
    class="event-grid-item"
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
        <p class="card-text text-muted small event-meta">
        <span>{{ fmtDateRange(event.earliest, event.latest) }}</span><br />
        <span>{{ event.instances.length }} date<span v-if="event.instances.length>1">s</span></span><br />
        <span>{{ event.venueName }}, {{ event.venueCity }}</span>
        </p>
        <p class="card-text description-truncate flex-grow-1">
          {{ event.description }}
        </p>
      </div>
      <div class="ticket-stub">
       <router-link
          :to="{
            name: 'EventDetails',
            params: { id: event.primaryInstanceId },
            state: {
              groupMeta: {
                title: event.title,
                venueName: event.venueName,
                venueCity: event.venueCity,
                earliest: event.earliest,
                latest: event.latest
              }
            }
          }"
          class="event-cta"
        >
          View Details & Start Quests →
        </router-link>
      </div>
    </div>
  </div>
</div>

<!-- 
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
                  {{ event.description }}
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
                  {{ event.description }}
                </p>
                <p class="card-text description-truncate">
                  {{ event.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div> -->

      <!-- no events found message -->
      <!-- 👇 Class reverted back to original -->
      <div v-if="!isLoading && groupedEvents.length === 0" class="text-center py-5 text-muted">
        <font-awesome-icon icon="fa-solid fa-magnifying-glass" class="fa-3x mb-3" aria-hidden="true" />
        <!-- 👇 Emoji removed -->
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
import EventPicker from './EventPicker.vue';
import Loading from './Loading.vue';
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

const showFilters = ref(false);

// new filter state
const selectedVenue = ref('all');
const dateFrom = ref(''); // yyyy-mm-dd
const dateTo = ref('');   // yyyy-mm-dd

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
// console.log('My API Key is:', apiKey);
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

const venueOptions = computed(() => {
  const set = new Set();
  for (const ev of allEvents.value) {
    // Use “Venue, City” so users can distinguish similarly named venues
    const label = [ev.venueName, ev.venueCity].filter(Boolean).join(', ');
    if (label) set.add(label);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
});

const locationFilterOptions = computed(() => [
  { value: 'all', label: 'All locations' },
  ...locationNames.value.map((location) => ({
    value: location,
    label: location,
  })),
]);

function toggleFilters() {
  showFilters.value = !showFilters.value;
}

function resetFilters() {
  selectedVenue.value = 'all';
  selectedDateRange.value = 'all';
  dateFrom.value = '';
  dateTo.value = '';
  searchQuery.value = '';
}

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
  const q = searchQuery.value.trim().toLowerCase();

  // parse date inputs (if provided)
  const from = dateFrom.value ? new Date(dateFrom.value) : null;
  const to = dateTo.value ? new Date(dateTo.value) : null;
  if (to) to.setHours(23, 59, 59, 999);

  return allEvents.value.filter((ev) => {
    // text search
    const matchesSearch =
      !q ||
      [ev.title, ev.description, ev.venueName, ev.venueCity]
        .filter(Boolean)
        .some((s) => s.toLowerCase().includes(q));

    // venue filter: compare against “Venue, City”
    const venueLabel = [ev.venueName, ev.venueCity].filter(Boolean).join(', ');
    const matchesVenue =
      selectedVenue.value === 'all' || venueLabel === selectedVenue.value;

    // quick range (today/week/month)
    const matchesQuick = matchesDateRange(ev.startDate);

    // date-from/to (calendar)
    let matchesBetween = true;
    const evDate = ev.startDate ? new Date(ev.startDate) : null;
    if (evDate) {
      if (from && evDate < from) matchesBetween = false;
      if (to && evDate > to) matchesBetween = false;
    } else if (from || to) {
      matchesBetween = false; // no date to compare against
    }

    return matchesSearch && matchesVenue && matchesQuick && matchesBetween;
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
      const derivedVenue = deriveVenueFromTitle(apiEvent.name);

      const venueName =
        apiEvent.venue?.name ||
        apiEvent.venue?.venueName ||
        apiEvent.venue?.address?.name ||
        derivedVenue ||
        'Venue TBA';

      const venueLocation =
        apiEvent.venue?.addressLocality ||
        apiEvent.venue?.address?.addressLocality ||
        apiEvent.venue?.address?.city ||
        apiEvent.venue?.location?.city ||
        apiEvent.venue?.city ||
        'Singapore'; // last-resort since you already filter to SG

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
        // id: apiEvent.id,
        id: apiEvent.id ?? apiEvent.name ?? Math.random().toString(36).slice(2, 9),
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
// --- GROUPING HELPERS (add) ---
function slugify(s) {
  return String(s ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-|]/g, '');
}
function makeGroupKey(ev) {
  return slugify(`${ev.title}|${ev.venueName}|${ev.venueCity}`);
}
function fmtDate(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtDateRange(earliest, latest) {
  const a = new Date(earliest);
  const b = new Date(latest);
  const sameDay = a.toDateString() === b.toDateString();
  if (sameDay) return fmtDate(a);
  const sameYear = a.getFullYear() === b.getFullYear();
  const aStr = a.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const bStr = sameYear
    ? b.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : b.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${aStr} – ${bStr}`;
}

const groupedEvents = computed(() => {
  const map = new Map();
  for (const ev of filteredEvents.value) {
    const key = makeGroupKey(ev);
    if (!map.has(key)) {
      map.set(key, {
        groupKey: key,
        title: ev.title,
        venueName: ev.venueName,
        venueCity: ev.venueCity,
        image: ev.image,
        description: ev.description,
        genres: ev.genres,
        earliest: ev.startDate,
        latest: ev.startDate,
        instances: [{ id: ev.id, startDate: ev.startDate }],
        primaryInstanceId: ev.id, // will keep the earliest
      });
    } else {
      const g = map.get(key);
      if (new Date(ev.startDate) < new Date(g.earliest)) {
        g.earliest = ev.startDate;
        g.primaryInstanceId = ev.id; // keep earliest instance id
      }
      if (new Date(ev.startDate) > new Date(g.latest)) g.latest = ev.startDate;
      g.instances.push({ id: ev.id, startDate: ev.startDate });
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.earliest) - new Date(b.earliest)
  );
});

function deriveVenueFromTitle(title) {
  if (!title) return null;
  // prefer “... at VENUE ( ... )” or “... at VENUE”
  const m1 = title.match(/\bat\s+([^()\-•|,]+?)(?:\s*\(|\s*-\s*|\s*•|\s*\||\s*$)/i);
  if (m1) return m1[1].trim();
  // fallback for “@ VENUE”
  const m2 = title.match(/@\s*([^()\-•|,]+?)(?:\s*\(|\s*-\s*|\s*•|\s*\||\s*$)/i);
  return m2 ? m2[1].trim() : null;
}


</script>

<style scoped>

.home-search {
  width: 100%;
  max-width: none;
}

.home-search .form-control {
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
}


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
  align-items: center; /* <-- This line was fixed (was align-items-center;) */
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

/* --- MODIFIED: Event Card for Ticket Shape --- */
.event-card {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  border-radius: 0.75rem; /* 12px */
  /* --- MODIFIED: overflow is now 'visible' to allow notches --- */
  overflow: visible;
  /* --- ADDED: position: relative is needed for notches --- */
  position: relative;
  background-color: #fff; /* Ensure card is white */
}


.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

/* --- MODIFIED: Card Image --- */
.card-img-top {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  /* ADDED to replace parent's overflow:hidden */
  border-radius: 0.75rem 0.75rem 0 0;
  position: relative; /* Establish stacking context */
  z-index: 1; /* Below the notches */
}

/* --- MODIFIED: Card Body --- */
.event-card .card-body {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  padding-top: 1.25rem;
  /* stacking/positioning for notches */
  position: relative;
  z-index: 1;
}

/* --- NEW: The Ticket Notches --- */
/* These pseudo-elements are attached to the card-body */
.event-card .card-body::before,
.event-card .card-body::after {
  content: '';
  position: absolute;
  /* Positioned at the top of the card-body, then moved up by half height */
  top: -12px; 
  width: 28px;
  height: 28px;
  /* Make the notch blend with the page so the card looks like a ticket cutout */
  background:
    #f4edff;
  border-radius: 50%;
  /* subtle separation and depth so the notch reads as a cutout */
  /* box-shadow: 0 1px 2px rgba(0,0,0,0.06); */
  /* border: 1px solid rgba(0,0,0,0.04); */
  z-index: 2;
  
}

.event-card .card-body::before {
  left: -12px; /* Halfway out the left side */
}

.event-card .card-body::after {
  right: -12px; /* Halfway out the right side */
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

/* --- NEW: Provide a page background variable so notches can "cut out" the card */
.container {
  /* Use a soft, subtle page background gradient. The notches will inherit this via --page-bg */
  --page-bg: linear-gradient(135deg, #f8f9fa 0%, #eef2ff 100%);
}

/* --- NEW: Make the "View Details" CTA look like a tear-off ticket stub --- */
.ticket-stub {
  position: relative;
  overflow: visible;
  border-radius: 0 0 0.75rem 0.75rem;
  /* the perforation sits along the top edge of the stub */
  margin-top: 0.8rem;
  z-index: 1; /* place the stub container behind the button's stacking context */
}

.ticket-stub::before,
.ticket-stub::after {
  /* semicircular notches that visually 'cut' into the card */
  content: '';
  position: absolute;
  top: -14px; /* half of notch height to sit across the seam */
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f4edff;
  border-radius: 50%;
  /* subtle separation and depth so the notch reads as a cutout */
  /* box-shadow: 0 1px 2px rgba(0,0,0,0.06); */
  /* border: 1px solid rgba(0,0,0,0.04); */
  z-index: 5; /* in FRONT of the button so the notch overlaps the button */
  pointer-events: none;
}

.ticket-stub::before { left: -14px; }
.ticket-stub::after { right: -14px; }

.ticket-stub {
  border-top: 2px dashed rgba(0,0,0,0.08);
}

/* Collapsible filter panel animation */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}
.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
  max-height: 540px; /* big enough for content */
  transform: translateY(0);
}

/* Optional: panel look */
.filter-panel {
  border: 1px solid rgba(0,0,0,0.06);
}
.filter-panel .form-select,
.filter-panel .form-control {
  border-radius: 0.75rem;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--bs-border-color, #ced4da);
  background-color: #fff;
  box-shadow: none;
}
.filter-panel .btn {
  border-radius: 0.75rem;
}

/* Ensure search + filter toggle align nicely */
.search-row .form-control {
  height: 3rem;
}
.filters-toggle .btn {
  height: 3rem;
  border-radius: 0.75rem;
}

/* Ensure the filter button text never wraps and the button sizes to content on sm+ */
@media (min-width: 576px) {
  .filters-toggle { flex: 0 0 auto; }
  /* Override w-100 from Bootstrap on sm+ so the button is only as wide as its label */
  .filters-toggle .btn {
    width: auto !important;
    white-space: nowrap;
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
.event-cta {
  display: block;
  width: 100%;
  padding: 0.9rem 1rem;
  text-align: center;
  font-weight: 600;
  color: rgba(255,255,255,0.95);
  font-size: 0.9rem; /* slightly smaller text */
  line-height: 1.1;
  /* use the app-wide gradient tokens for consistency */
  background: linear-gradient(90deg, var(--primary-1) 0%, var(--primary-2) 100%);
  border: 0;
  border-radius: 0 0 0.75rem 0.75rem;
  box-shadow: 0 6px 18px rgba(91, 33, 182, 0.08);
  transition: transform 160ms ease, box-shadow 160ms ease;
  position: relative;
  z-index: 4; /* ensure button sits *behind* the semicircle notches */
}


.event-cta:hover { transform: translateY(-3px); box-shadow: 0 10px 26px rgba(91,33,182,0.12); }

/* remove underline and ensure anchor styles don't add decoration */
.event-cta,
.event-cta:visited,
.event-cta:active,
.event-cta:hover {
  text-decoration: none !important;
  -webkit-text-decoration-skip: none;
}

/* slightly smaller on very small screens */
@media (max-width: 375px) {
  .event-cta { font-size: 0.84rem; }
}

@media (max-width: 575.98px) {
  .ticket-stub::before, .ticket-stub::after { width: 22px; height: 22px; top: -11px; }
}

</style>
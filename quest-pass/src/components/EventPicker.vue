<template>
	<section class="event-picker container my-4">
		<!-- Make the whole picker a card -->
		<div class="card event-picker-card shadow-sm border-0 p-4">
			<div class="row align-items-center g-4">
			<!-- Turntable / Vinyl -->
			<div class="col-12 col-md-6 d-flex flex-column align-items-center">
				<div class="turntable" :class="{ active: isSpinning }" aria-live="polite">
					<!-- platter shadow -->
					<div class="platter-shadow" />

					<!-- vinyl disc -->
					<div class="vinyl" :class="{ spinning: isSpinning }">
						<div class="grooves"></div>
						<div class="label">
							<div class="label-text">
								<span v-if="!isSpinning && !selectedEvent">Spin for an Event</span>
								<span v-else-if="isSpinning">Finding one…</span>
								<span v-else>{{ compactTitle(selectedEvent?.title) }}</span>
							</div>
						</div>
						<div class="spindle" />
					</div>

					<!-- tonearm -->
					<div class="tonearm" :class="{ playing: isSpinning }">
						<div class="head"></div>
					</div>
				</div>

				<div class="mt-3">
					<button
						class="btn qp-btn"
						:disabled="isSpinning || !hasEvents"
						@click="spinForEvent"
					>
						<i class="fas fa-compact-disc me-2"></i>
						{{ isSpinning ? 'Spinning…' : (selectedEvent ? 'Spin again' : 'Spin the Vinyl') }}
					</button>
				</div>

				<p v-if="!hasEvents" class="text-muted small mt-2">
					No events available to pick right now.
				</p>
			</div>

					<!-- Recommendation panel -->
					<div class="col-12 col-md-6">
						<div v-if="selectedEvent" class="card event-card shadow-sm border-0">
							<img
								:src="selectedEvent.image || fallbackImg"
								class="card-img-top"
								alt="Event Image"
								@error="onImgError"
							/>
							<div class="card-body d-flex flex-column">
								<h5 class="card-title fw-bold mb-1">{{ selectedEvent.title }}</h5>
								<p class="text-muted small mb-2">{{ selectedEvent.date }}</p>
								<p v-if="selectedEvent.description" class="card-text description-truncate flex-grow-1">
									{{ selectedEvent.description }}
								</p>
							</div>
							<!-- Ticket stub CTA like Home view -->
							<div class="ticket-stub">
								<router-link
									v-if="selectedEvent.id"
									:to="{ name: 'EventDetails', params: { id: selectedEvent.id } }"
									class="event-cta"
								>
									View Details & Start Quests →
								</router-link>
								<button v-else class="event-cta btn btn-secondary w-100" disabled>
									Details unavailable
								</button>
							</div>
						</div>

						<div v-else class="placeholder-text text-muted">
							Spin the vinyl to get a curated event to start your quest.
						</div>
					</div>
					</div>
				</div>
	</section>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
	events: {
		type: Array,
		default: () => [],
	},
});

const isSpinning = ref(false);
const selectedEvent = ref(null);
const fallbackImg = 'https://placehold.co/400x200/a78bfa/ffffff?text=Event';

const hasEvents = computed(() => (props.events?.length ?? 0) > 0);

watch(
	() => props.events,
	(list) => {
		// if the previously selected event is no longer in the list, clear it
		if (!list?.length) {
			selectedEvent.value = null;
		} else if (
			selectedEvent.value &&
			!list.find((e) => e.id === selectedEvent.value.id)
		) {
			selectedEvent.value = null;
		}
	},
	{ deep: true }
);

function compactTitle(title) {
	if (!title) return '';
	const s = String(title);
	return s.length > 20 ? s.slice(0, 18) + '…' : s;
}

function onImgError(evt) {
	evt.target.src = fallbackImg;
}

function spinForEvent() {
	if (!hasEvents.value || isSpinning.value) return;

	isSpinning.value = true;

	// simulate a short spin duration with a flourish
	const duration = 2200 + Math.floor(Math.random() * 1000); // 2.2s - 3.2s

	// precompute a candidate (uniform)
	const idx = Math.floor(Math.random() * props.events.length);
	const candidate = props.events[idx];

	// set result when spin completes
	window.setTimeout(() => {
		selectedEvent.value = candidate ?? null;
		isSpinning.value = false;
	}, duration);
}
</script>

<style scoped>
.event-picker {
	/* Provide a subtle page-bg so Home notches can blend if needed */
	/* Match Home's gradient for when cards sit directly on the page */
	--page-bg: linear-gradient(135deg, #f8f9fa 0%, #eef2ff 100%);
}

/* Outer card styling */
.event-picker-card {
	border-radius: 16px;
	background: #fff;
	/* Ambient background that inner notches should reveal */
	--ambient-bg: #fff;
}

.turntable {
	position: relative;
	width: clamp(220px, 60vw, 320px);
	aspect-ratio: 1 / 1;
	border-radius: 16px;
	background: linear-gradient(135deg, #1f2534 0%, #121723 100%);
	box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25);
	padding: 18px;
	overflow: hidden;
}

.platter-shadow {
	position: absolute;
	inset: 0;
	background: radial-gradient(circle at 40% 35%, rgba(255,255,255,0.06), transparent 50%),
							radial-gradient(circle at 60% 70%, rgba(255,255,255,0.04), transparent 45%);
	pointer-events: none;
}

.vinyl {
	position: absolute;
	inset: 10% 10% 10% 10%;
	border-radius: 50%;
	background: radial-gradient(circle at 50% 45%, #262b3a 0%, #0d111a 65%, #0a0e15 100%);
	box-shadow: inset 0 0 20px rgba(0,0,0,0.6), 0 6px 18px rgba(0,0,0,0.35);
	display: grid;
	place-items: center;
}

.vinyl.spinning {
	animation: spin 0.9s linear infinite;
}

.grooves {
	position: absolute;
	inset: 8%;
	border-radius: 50%;
	background: repeating-radial-gradient(
		circle,
		rgba(255, 255, 255, 0.05) 0px,
		rgba(255, 255, 255, 0.05) 2px,
		rgba(255, 255, 255, 0) 3px,
		rgba(255, 255, 255, 0) 4px
	);
	filter: blur(0.2px);
}

.label {
	position: relative;
	width: 46%;
	aspect-ratio: 1 / 1;
	border-radius: 50%;
	background: conic-gradient(from 120deg, var(--accent-1, #a78bfa), var(--accent-2, #60a5fa));
	display: grid;
	place-items: center;
	color: #fff;
	text-align: center;
	padding: 8px;
}

.label::after {
	content: '';
	position: absolute;
	inset: 10px;
	border-radius: 50%;
	background: radial-gradient(circle at 50% 40%, rgba(255,255,255,0.25), rgba(255,255,255,0.05));
	pointer-events: none;
}

.label-text {
	position: relative;
	z-index: 1;
	font-weight: 700;
	font-size: clamp(0.7rem, 2.4vw, 1rem);
	line-height: 1.15;
	text-shadow: 0 1px 2px rgba(0,0,0,0.35);
	padding: 0 6px;
}

.spindle {
	position: absolute;
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background: #c8d0e3;
	box-shadow: inset 0 0 2px rgba(0,0,0,0.5);
}

.tonearm {
	position: absolute;
	right: -24px;
	top: 18px;
	width: 160px;
	height: 12px;
	background: linear-gradient(#c9ced8, #aeb6c7);
	border-radius: 6px;
	transform-origin: left center;
	transform: rotate(22deg);
	transition: transform 0.6s ease;
	box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.tonearm.playing {
	transform: rotate(12deg);
}

.tonearm .head {
	position: absolute;
	right: 0;
	top: -6px;
	width: 26px;
	height: 26px;
	border-radius: 4px;
	background: #1f2937;
	box-shadow: inset 0 0 4px rgba(255,255,255,0.12), 0 4px 10px rgba(0,0,0,0.35);
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

/* .reco-card removed; using .event-card structure instead */

/* --- Ticket-style card (copied to match Home view) --- */
.event-card {
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
	transition:
	  transform 0.2s ease,
	  box-shadow 0.2s ease;
	border-radius: 0.75rem; /* 12px */
	overflow: visible; /* allow notches */
	position: relative;
	background-color: #fff;
}

.event-card:hover {
	transform: translateY(-5px);
	box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.card-img-top {
	width: 100%;
	aspect-ratio: 16 / 9;
	object-fit: cover;
	border-radius: 0.75rem 0.75rem 0 0;
	position: relative;
	z-index: 1;
}

.event-card .card-body {
	flex: 1 1 auto;
	display: flex;
	flex-direction: column;
	padding-top: 1.25rem;
	position: relative;
	z-index: 1;
}

.event-card .card-body::before,
.event-card .card-body::after {
	content: '';
	position: absolute;
	top: -12px;
	width: 28px;
	height: 28px;
	/* Use ambient bg to blend with the surrounding picker card */
	background: var(--ambient-bg, #fff);
	border-radius: 50%;
	/* Softer hint so it reads as a die-cut without visible edge */
	box-shadow: 0 1px 1px rgba(0,0,0,0.03);
	border: 0;
	z-index: 2;
}

.event-card .card-body::before { left: -12px; }
.event-card .card-body::after { right: -12px; }

.description-truncate {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
}

.ticket-stub {
	position: relative;
	overflow: visible;
	border-radius: 0 0 0.75rem 0.75rem;
	margin-top: 0.8rem;
	z-index: 1;
}

.ticket-stub::before,
.ticket-stub::after {
	content: '';
	position: absolute;
	top: -14px;
	width: 28px;
	height: 28px;
	border-radius: 50%;
	/* Match the surrounding (outer card) background for perfect blending */
	background: var(--ambient-bg, #fff);
	box-shadow: 0 1px 1px rgba(0,0,0,0.03);
	border: 0;
	z-index: 5;
	pointer-events: none;
}

.ticket-stub::before { left: -14px; }
.ticket-stub::after { right: -14px; }

.ticket-stub { border-top: 2px dashed rgba(0,0,0,0.08); }

.event-cta {
	display: block;
	width: 100%;
	padding: 0.9rem 1rem;
	text-align: center;
	font-weight: 600;
	color: rgba(255,255,255,0.95);
	font-size: 0.9rem;
	line-height: 1.1;
	background: linear-gradient(90deg, var(--primary-1, #a78bfa) 0%, var(--primary-2, #60a5fa) 100%);
	border: 0;
	border-radius: 0 0 0.75rem 0.75rem;
	box-shadow: 0 6px 18px rgba(91, 33, 182, 0.08);
	transition: transform 160ms ease, box-shadow 160ms ease;
	position: relative;
	z-index: 4;
	text-decoration: none !important;
}

.event-cta:hover {
	transform: translateY(-3px);
	box-shadow: 0 10px 26px rgba(91,33,182,0.12);
}

.placeholder-text {
	padding: 1.25rem;
	border: 1px dashed rgba(0,0,0,0.1);
	border-radius: 12px;
}

@media (max-width: 575.98px) {
	.card-img-top { height: 160px; }
}
</style>


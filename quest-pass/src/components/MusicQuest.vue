<template>
  <div class="quest-overlay" @click.self="closeQuest">
    <div class="card quest-card-modal quest-card-glass shadow-lg">
      <button class="btn-close-overlay btn-close-white" type="button" @click="closeQuest">
        &times;
      </button>

      <div class="modal-header border-bottom-0 header-spotify">
        <div class="d-flex align-items-center gap-3">
          <span class="spotify-badge">
            <FontAwesomeIcon :icon="['fab', 'spotify']" />
          </span>
          <div>
            <h5 class="modal-title fw-bold m-0">Music Discovery</h5>
            <small class="text-muted">Earn {{ MUSIC_MAX }} points by listening to {{ artistName }}</small>
          </div>
        </div>
      </div>

      <div class="modal-body p-4 p-md-5">
        <div class="mb-4 text-muted">
          We’ll check your recently played tracks. If we find at least five songs by
          <strong>{{ artistName }}</strong>, you’ll receive {{ MUSIC_MAX }} points.
        </div>

        <div v-if="isQuestCompleted" class="alert alert-success d-flex align-items-center gap-2" role="status">
          <i class="fas fa-check-circle"></i>
          <span>Great news! You’ve already completed this quest.</span>
        </div>

        <template v-else>
          <div class="mb-3">
            <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
            <div v-else-if="loading" class="alert alert-info d-flex align-items-center gap-2" role="status">
              <span class="spinner-border spinner-border-sm" role="presentation"></span>
              <span>Checking your Spotify plays…</span>
            </div>
            <div v-else class="alert alert-light border" role="status">
              Plays detected for <strong>{{ artistName }}</strong>:
              <strong>{{ plays }}</strong> / 5
            </div>
          </div>

          <div class="d-flex flex-wrap gap-2 justify-content-end">
            <button
              class="btn btn-primary"
              type="button"
              :disabled="loading"
              @click="token() ? checkSpotify() : startSpotifyAuth()"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="presentation"></span>
              {{ primaryButtonLabel }}
            </button>
            <button class="btn btn-outline-secondary" type="button" @click="closeQuest" :disabled="loading">
              Close
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quest-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  backdrop-filter: blur(10px);
}

.quest-card-modal {
  position: relative;
  width: min(90vw, 560px);
  border: none;
  border-radius: 1rem;
  animation: fadeIn 0.25s ease-out;
}

.quest-card-glass {
  background: #fff;
  color: var(--ink, #1f1f1f);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 24px 45px rgba(15, 23, 42, 0.18);
}

.header-spotify {
  background: linear-gradient(135deg, rgba(29, 185, 84, 0.15), rgba(29, 185, 84, 0.05));
  border-bottom: 1px solid rgba(29, 185, 84, 0.15);
}

.spotify-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #1db954;
  color: #fff;
  font-size: 1.5rem;
  box-shadow: 0 10px 20px rgba(29, 185, 84, 0.35);
}

.btn-close-overlay {
  position: absolute;
  top: 12px;
  right: 18px;
  background: transparent;
  border: none;
  font-size: 2rem;
  line-height: 1;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: color 0.2s ease;
  z-index: 5;
}

.btn-close-overlay:hover,
.btn-close-overlay:focus {
  color: #fff;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(12px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.alert[role='status'] {
  margin-bottom: 0;
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const MUSIC_MAX = 300;

const props = defineProps({
  artistName: { type: String, required: true },
  questData: { type: Object, required: true },
});
const emit = defineEmits(['update-progress', 'close']);

const loading = ref(false);
const error = ref('');
const plays = ref(0);

const isQuestCompleted = computed(() => props.questData?.completed === true);
const primaryButtonLabel = computed(() => {
  if (loading.value) return 'Please wait…';
  return token() ? 'Check Spotify Now' : 'Connect Spotify';
});

function token() {
  return localStorage.getItem('spotify_access_token') || '';
}
function norm(s) {
  return (s || '').toString().trim().toLowerCase();
}

const TIMEOUT_MS = 7000;
const SPOTIFY_CLIENT_ID = 'f3e1635e835b47359c14736ee86068f4';
const SPOTIFY_SCOPE = 'user-read-private user-read-email user-read-recently-played';
const SPOTIFY_REDIRECT_URI =
  import.meta.env.VITE_SPOTIFY_REDIRECT_URI || `${window.location.origin}/spotify-callback`;

function base64url(ab) {
  const b = new Uint8Array(ab);
  let s = '';
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
async function sha256(s) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
}
function randomString(n = 64) {
  const a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let r = '';
  for (let i = 0; i < n; i += 1) r += a[Math.floor(Math.random() * a.length)];
  return r;
}

async function startSpotifyAuth(options = {}) {
  const { preserveError = false, autoLoading = true } = options;
  try {
    if (!preserveError) error.value = '';
    if (autoLoading) loading.value = true;

    const verifier = randomString(64);
    const challenge = base64url(await sha256(verifier));
    localStorage.setItem('sp_verifier', verifier);

    const state = crypto.randomUUID();
    localStorage.setItem('sp_state', state);

    const auth = new URL('https://accounts.spotify.com/authorize');
    auth.searchParams.set('client_id', SPOTIFY_CLIENT_ID);
    auth.searchParams.set('response_type', 'code');
    auth.searchParams.set('redirect_uri', SPOTIFY_REDIRECT_URI);
    auth.searchParams.set('scope', SPOTIFY_SCOPE);
    auth.searchParams.set('state', state);
    auth.searchParams.set('code_challenge_method', 'S256');
    auth.searchParams.set('code_challenge', challenge);

    const w = 520;
    const h = 700;
    const y = window.top.outerHeight / 2 + window.top.screenY - h / 2;
    const x = window.top.outerWidth / 2 + window.top.screenX - w / 2;
    const popup = window.open(
      auth.toString(),
      'spotify-auth',
      `width=${w},height=${h},left=${x},top=${y},resizable,scrollbars`,
    );
    if (!popup) {
      error.value = 'Please allow popups to connect Spotify.';
      loading.value = false;
      return;
    }
    try {
      popup.focus();
    } catch (e) {
      /* no-op */
    }

  } catch (e) {
    error.value = 'Could not start Spotify auth.';
    loading.value = false;
  }
}

async function handleExpiredSpotifySession() {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('sp_last_auth_ts');

  loading.value = false;
  await startSpotifyAuth({ autoLoading: false });
  if (!error.value) {
    error.value = 'Spotify login expired. Please complete the Spotify login popup.';
  }
}

async function checkSpotify() {
  if (loading.value) return;
  loading.value = true;
  error.value = '';
  plays.value = 0;

  const t = token();
  if (!t) {
    error.value = 'Not connected to Spotify. Tap “Connect Spotify” to start.';
    loading.value = false;
    return;
  }

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

    const res = await fetch(
      'https://api.spotify.com/v1/me/player/recently-played?limit=50',
      { headers: { Authorization: `Bearer ${t}` }, signal: ctrl.signal },
    );
    clearTimeout(timer);

    if (res.status === 401) {
      await handleExpiredSpotifySession();
      return;
    }
    if (!res.ok) throw new Error((await res.text()) || `Spotify error (${res.status})`);

    const data = await res.json();
    const target = norm(props.artistName);

    let count = 0;
    for (const item of data.items || []) {
      const names = (item.track?.artists || []).map((a) => norm(a.name));
      if (names.some((n) => n.includes(target))) count += 1;
    }

    plays.value = count;

    if (count >= 5) {
      emit('update-progress', { points: MUSIC_MAX, completed: true });
    } else {
      error.value = `We didn’t find 5 recent plays by “${props.artistName}”. Try again later.`;
    }
  } catch (e) {
    error.value = e?.name === 'AbortError'
      ? 'Spotify check timed out. Please try again.'
      : String(e?.message || e);
  } finally {
    loading.value = false;
  }
}

function onMessage(e) {
  if (e.origin !== window.location.origin) return;
  const msg = e.data || {};
  if (msg.source === 'spotify') {
    if (msg.ok) {
      loading.value = false;
      error.value = '';
      // Give the popup a moment to persist refreshed tokens before checking plays again.
      requestAnimationFrame(() => {
        if (!loading.value) checkSpotify();
      });
    } else {
      error.value = 'Spotify login failed. Please try again.';
      loading.value = false;
    }
  }
}

function closeQuest() {
  if (!loading.value) {
    emit('close');
  }
}

onMounted(() => {
  window.addEventListener('message', onMessage);
  if (token()) checkSpotify();
});
onUnmounted(() => window.removeEventListener('message', onMessage));
</script>

<template>
  <div class="p-4">
    <h4>Connecting Spotify…</h4>
    <p v-if="msg">{{ msg }}</p>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';

// Match the value used when initiating auth (allows env override during dev)
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || `${window.location.origin}/spotify-callback`;
const TOKEN_URL = 'https://accounts.spotify.com/api/token';

const msg = ref('Exchanging code for tokens…');

// ✅ send the *actual* ok flag + error text back to the opener
function postBack(ok, errorText = '') {
  try {
    window.opener?.postMessage(
      { source: 'spotify', ok, error: errorText },   // <— ok is not hardcoded now
      window.location.origin
    );
  } catch {}
  window.close();
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

onMounted(async () => {
  try {
    const code  = getParam('code');
    const state = getParam('state');

    if (!code) {
      msg.value = 'Missing "code" from Spotify.';
      return postBack(false, 'NO_CODE');
    }

    // ✅ use localStorage (shared across windows)
    const expectedState = localStorage.getItem('sp_state');
    if (!state || !expectedState || state !== expectedState) {
      msg.value = 'State mismatch.';
      return postBack(false, 'STATE_MISMATCH');
    }

    const verifier = localStorage.getItem('sp_verifier');
    if (!verifier) {
      msg.value = 'Missing code_verifier. Start login again.';
      return postBack(false, 'NO_VERIFIER');
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      client_id: 'f3e1635e835b47359c14736ee86068f4',
      code_verifier: verifier,
    });

    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error('Token error:', txt);
      msg.value = 'Spotify token request failed.';
      return postBack(false, txt);
    }

    const json = await res.json();

    // ✅ store & clean
    localStorage.setItem('spotify_access_token', json.access_token);
    if (json.refresh_token) localStorage.setItem('spotify_refresh_token', json.refresh_token);
    localStorage.setItem('sp_last_auth_ts', String(Date.now()));
    localStorage.removeItem('sp_state');
    localStorage.removeItem('sp_verifier');

    msg.value = 'Connected! You can close this window.';
    postBack(true);
  } catch (err) {
    console.error(err);
    msg.value = 'Spotify token request failed.';
    postBack(false, (err && err.message) || 'FETCH_ERROR');
  }
});
</script>

<style scoped>
.p-4 { font-family: system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial; }
</style>

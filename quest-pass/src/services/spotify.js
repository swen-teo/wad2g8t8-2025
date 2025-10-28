// --- Configuration ---
const SPOTIFY_CLIENT_ID = 'c48d59929a834b6c8a3027177b81fd4f';
const SPOTIFY_REDIRECT_URI =
  'https://damp-werewolf-x6rr5rjxrq626vrq-8888.app.github.dev/MusicQuest.vue';
const SPOTIFY_SCOPES = ['user-read-recently-played'];
const SPOTIFY_AUTH = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN = 'https://accounts.spotify.com/api/token';
const SPOTIFY_RECENTLY_PLAYED =
  'https://api.spotify.com/v1/me/player/recently-played?limit=50';
const MUSIC_MAX = 300; // Max points for this quest

// --- Internal PKCE Helper Functions ---

/**
 * Generates a random string for PKCE.
 */
function generateCodeVerifier(length) {
  let text = '';
  const possible = 'abcdefghijklmnopqrstuvwxyz0123456789-._~';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

/**
 * Hashes the verifier string to create a challenge.
 */
async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('sha-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Fetches the Spotify access token using the auth code and verifier.
 */
async function getSpotifyToken(code, verifier) {
  const params = new URLSearchParams();
  params.append('client_id', SPOTIFY_CLIENT_ID);
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', SPOTIFY_REDIRECT_URI);
  params.append('code_verifier', verifier);

  const result = await fetch(SPOTIFY_TOKEN, {
    method: 'post',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!result.ok) {
    throw new Error('Failed to get Spotify token.');
  }

  const { access_token } = await result.json();
  return access_token;
}

/**
 * Validates listening history against the artist.
 * @returns {Promise<Object>} A promise resolving to { points, completed }
 */
async function validateSpotifyListen(token, artistName) {
  const result = await fetch(SPOTIFY_RECENTLY_PLAYED, {
    headers: { authorization: `bearer ${token}` },
  });

  if (!result.ok) {
    if (result.status === 401) {
      // Token expired or invalid
      throw new Error('Spotify token is invalid. Please re-authenticate.');
    }
    throw new Error('Failed to fetch recently played tracks.');
  }

  const data = await result.json();

  // Find all tracks by the correct artist
  const artistTracks = data.items.filter((item) => {
    return item.track.artists.some(
      (a) => a.name.toLowerCase() === artistName.toLowerCase()
    );
  });

  // Calculate points
  const newPoints = Math.min(artistTracks.length * 10, MUSIC_MAX);

  return {
    points: newPoints,
    completed: newPoints === MUSIC_MAX,
  };
}

// --- Exported Functions for Components ---

/**
 * Initiates the Spotify PKCE Auth flow by redirecting the user.
 */
export async function redirectToSpotifyAuth() {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem('spotify_verifier', verifier);

  const params = new URLSearchParams();
  params.append('client_id', SPOTIFY_CLIENT_ID);
  params.append('response_type', 'code');
  params.append('redirect_uri', SPOTIFY_REDIRECT_URI);
  params.append('scope', SPOTIFY_SCOPES.join(' '));
  params.append('code_challenge_method', 's256');
  params.append('code_challenge', challenge);

  // Redirect the user
  window.location.href = `${SPOTIFY_AUTH}?${params.toString()}`;
}

/**
 * Handles the redirect from Spotify, gets the token, validates listening,
 * and returns the progress.
 * @param {string} artistName - The artist to validate against.
 * @returns {Promise<Object|null>} A promise resolving to { points, completed } or null.
 */
export async function handleSpotifyRedirect(artistName) {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  if (!code) {
    return null; // Not a redirect
  }

  const verifier = localStorage.getItem('spotify_verifier');
  if (!verifier) {
    throw new Error('No Spotify verifier found. Please try logging in again.');
  }

  try {
    // 1. Get token
    const token = await getSpotifyToken(code, verifier);
    localStorage.removeItem('spotify_verifier'); // Clean up

    // 2. Clear code from URL
    window.history.replaceState({}, '', SPOTIFY_REDIRECT_URI);

    // 3. Validate listening history and return progress
    return await validateSpotifyListen(token, artistName);
  } catch (error) {
    console.error('Error handling Spotify redirect:', error);
    // Clean up URL even if it fails
    window.history.replaceState({}, '', SPOTIFY_REDIRECT_URI);
    throw error; // Re-throw for the component to handle
  }
}

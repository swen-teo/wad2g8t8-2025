# Quest Pass (WAD2 Project)

A Vue 3 + Vite single-page app that gamifies live events with quests and rewards. Users can explore events, complete music and trivia quests, and track progress tied to their profile via Firebase.

## What’s inside

- Frontend: Vue 3 (Vite, Pinia, Vue Router, Bootstrap)
- Auth/DB: Firebase (Auth, Firestore)
- Integrations:
	- Spotify PKCE flow for MusicQuest (validates Recently Played)
	- Gemini-backed quiz for TriviaQuest
		- Dev: built-in Vite middleware serves POST /api/quiz using your GEMINI_API_KEY
		- Prod: optional Cloud Function generateQuiz (set GEMINI_API_KEY secret)
- Cloud Functions for Firebase:
	- populateEventsFromJambase (HTTP) to seed Firestore with events using a JAMBASE_KEY secret
	- generateRewardCodeOnEventCreate (Firestore trigger) to add reward codes to new events
	- generateQuiz (HTTP) to return 5 MCQ questions via Gemini (optional in prod)

## Folder structure

```
quest-pass/
  firebase.json
  vite.config.js            # Vite dev on port 8888; @ alias to src; dev quiz middleware
  package.json              # dev, build, preview scripts
  index.html
  public/
  src/
    main.js
    App.vue
    style.css
    firebase.js             # Firebase web config (currently hard-coded)
    assets/
    components/             # (Home, LandingPage, Login, MusicQuest, TriviaQuest, etc.)
    route/
      routes.js
    services/
      spotify.js            # Spotify PKCE + Recently Played validation
      gemini-quiz.js        # Uses /api/quiz (dev) or VITE_QUIZ_API_URL (prod)
    store/
      user.js
  functions/
    index.js                # Jambase importer, reward code trigger, generateQuiz
    package.json            # engines.node=22
```

## Prerequisites

- Node.js 18+ for the frontend (Vite 7). For Firebase Functions deploy, use Node 22 (as set in `functions/package.json`).
- Firebase CLI (login and project access):
	- Install: `npm i -g firebase-tools`
	- Login: `firebase login`
- A Firebase project with Firestore and Authentication enabled
- Spotify Developer App (Client ID + redirect URI)
- A backend for the quiz endpoint (or a mock) reachable at `/api/quiz`

## Quick start (frontend)

1) Install dependencies

```
cd quest-pass
npm install
```

2) Configure env (for Trivia in dev)

Create `quest-pass/.env.local` with your Gemini API key (either name works):

```
# quest-pass/.env.local
GEMINI_API_KEY=your_gemini_api_key
# or
VITE_GEMINI_API_KEY=your_gemini_api_key
```

3) Start the dev server (Vite on port 8888)

```
npm run dev
```

4) Open the app

- Local: http://localhost:8888
- In Codespaces, use the forwarded URL for port 8888

## Configuration

### Firebase web config

The current project has Firebase config hard-coded in `quest-pass/src/firebase.js`. For your own project:

- Create a Web App in Firebase Console and copy the config
- Update the object in `src/firebase.js` to match your project, or refactor to use Vite env vars (recommended):
	- Example env keys if you refactor: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`

Make sure Authentication (Email/Password or providers you use) and Firestore are enabled.

### Spotify (MusicQuest)

`quest-pass/src/services/spotify.js` currently hard-codes:

- SPOTIFY_CLIENT_ID
- SPOTIFY_REDIRECT_URI (a Codespaces URL on port 8888)

To use your own Spotify app:

1) Create a Spotify Developer App and copy the Client ID
2) Add your redirect URI in the app settings (must match exactly)
3) Update the constants in `src/services/spotify.js`, or refactor to env vars (recommended):
	- `VITE_SPOTIFY_CLIENT_ID`, `VITE_SPOTIFY_REDIRECT_URI`

Tip: If you refactor to env, set them in `quest-pass/.env.local`.

Common pitfall: redirect URI mismatch between Spotify app settings and code.

### Trivia (Gemini)

Dev mode:

- Vite runs a small dev middleware that serves `POST /api/quiz` using your Gemini API key.
- Set `GEMINI_API_KEY` (or `VITE_GEMINI_API_KEY`) in `quest-pass/.env.local`.

Prod options:

- Deploy the Cloud Function `generateQuiz` and set the secret once:
	- `firebase functions:secrets:set GEMINI_API_KEY`
- Point the frontend to the deployed endpoint by setting `VITE_QUIZ_API_URL` in your SPA env, e.g.:
	- `VITE_QUIZ_API_URL=https://us-central1-<your-project>.cloudfunctions.net/generateQuiz`

Request/response contract (used by both dev middleware and function):

- Method: POST
- Body: `{ "artist": string }`
- Response: `[{ question: string, options: string[4], correctAnswer: string }, ...]`

## Firebase Functions (optional but recommended)

Functions live in `quest-pass/functions/` and use Node 22.

Included endpoints/triggers:

- `populateEventsFromJambase` (HTTP) – seeds Firestore with events; requires `JAMBASE_KEY`
- `generateRewardCodeOnEventCreate` (Firestore trigger) – adds `rewardCode` to new events
- `generateQuiz` (HTTP) – returns 5 MCQ questions; requires `GEMINI_API_KEY`

### Local emulation

1) Create `quest-pass/functions/.env` with required secrets:

```
# quest-pass/functions/.env
JAMBASE_KEY=your_jambase_api_key
GEMINI_API_KEY=your_gemini_api_key
```

2) Start the Functions emulator:

```
cd quest-pass/functions
npm install
npm run serve
```

Example emulator URLs:

```
http://127.0.0.1:5001/<your-firebase-project>/us-central1/populateEventsFromJambase
http://127.0.0.1:5001/<your-firebase-project>/us-central1/generateQuiz
```

### Deploy to Firebase

1) Set production secrets (one-time per update):

```
firebase functions:secrets:set JAMBASE_KEY
firebase functions:secrets:set GEMINI_API_KEY
```

2) Deploy functions:

```
cd quest-pass/functions
npm run deploy
```

### Jambase API key (getting/renewing)

If your JAMBASE_KEY expires or you need a new one, request a key at:

- https://data.jambase.com/try/

After obtaining a new key, update your local `.env` for emulation and re-set the production secret:

```
# Local (functions emulator)
quest-pass/functions/.env

JAMBASE_KEY=your_new_jambase_api_key

# Production (one-time per update)
firebase functions:secrets:set JAMBASE_KEY
```

Note: `firebase.json` currently configures Functions only (no Hosting). You can add Hosting later to deploy the SPA, or deploy the frontend to Vercel/Netlify.

## Scripts

In `quest-pass/package.json`:

- `npm run dev` – start Vite dev server (port 8888)
- `npm run build` – production build
- `npm run preview` – preview the production build locally

In `quest-pass/functions/package.json`:

- `npm run serve` – start Firebase Functions emulator
- `npm run deploy` – deploy functions only
- `npm run logs` – stream function logs

## Troubleshooting

- Vite dev port: The app runs on port 8888 (see `vite.config.js`). Update external redirects (Spotify) accordingly in Codespaces or your local hostname.
- Spotify 401/redirect issues: ensure the client ID and redirect URI match Spotify app settings exactly.
- Trivia dev errors like `GEMINI_API_KEY missing` or HTTP 502: set `GEMINI_API_KEY` or `VITE_GEMINI_API_KEY` in `quest-pass/.env.local`.
- Pointing to prod quiz: set `VITE_QUIZ_API_URL` to the deployed Cloud Function URL.
- CORS/404 for quiz in prod: ensure the function is deployed and the URL/region is correct.
- Firestore permission errors: verify Firebase rules and that you’re authenticated where required.
- Missing JAMBASE_KEY: set the secret in `functions/.env` for emulators and with `firebase functions:secrets:set` for deploys.

## Roadmap / nice-to-haves

- Move hard-coded keys/URIs to Vite env vars with `.env.local` and `.env.production`
- Add Firebase Hosting config for a single-command deploy of the SPA
- Add basic tests and a CI workflow (build/lint) for PRs
- Add screenshots or a short demo GIF to this README

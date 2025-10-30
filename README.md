# Quest Pass (WAD2 Project)

A Vue 3 + Vite single-page app that gamifies live events with quests and rewards. Users can explore events, complete music and trivia quests, and track progress tied to their profile via Firebase.

## What’s inside

- Frontend: Vue 3 (Vite, Pinia, Vue Router, Bootstrap)
- Auth/DB: Firebase (Auth, Firestore)
- Integrations:
	- Spotify PKCE flow for MusicQuest (recently played validation)
	- Gemini-backed quiz endpoint for TriviaQuest (via an external API)
- Cloud Functions for Firebase:
	- populateEventsFromJambase (HTTP) to seed Firestore with events using a JAMBASE_KEY secret
	- generateRewardCodeOnEventCreate (Firestore trigger) to add reward codes to new events

## Folder structure

```
quest-pass/
	firebase.json
	vite.config.js            # Vite dev on port 8888, @ alias to src
	package.json              # dev, build, preview scripts
	index.html
	public/
	src/
		main.js
		App.vue
		style.css
		firebase.js            # Firebase web config (currently hard-coded)
		assets/
		components/
			EventDetails.vue
			EventPicker.vue
			FilterSelect.vue
			Home.vue
			LandingPage.vue
			Login.vue
			MusicQuest.vue
			Navbar.vue
			Profile.vue
			TriviaQuest.vue
		route/
			routes.js
		services/
			spotify.js           # Spotify PKCE and listen validation
			gemini-quiz.js       # Calls external /api/quiz endpoint
		store/
			user.js
	functions/
		index.js               # Jambase importer + reward code trigger
		package.json           # engines.node=22
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

2) Start the dev server (Vite on port 8888)

```
npm run dev
```

3) Open the app

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

`quest-pass/src/services/spotify.js` uses:

- SPOTIFY_CLIENT_ID (currently hard-coded)
- SPOTIFY_REDIRECT_URI (currently a Codespaces URL on port 8888)

To use your own Spotify app:

1) Create a Spotify Developer App and copy the Client ID
2) Add your redirect URI in the app settings (must exactly match)
3) Update the constants in `src/services/spotify.js` to your values, or refactor to use env vars (e.g., `VITE_SPOTIFY_CLIENT_ID`, `VITE_SPOTIFY_REDIRECT_URI`)

Common pitfall: a mismatch between the configured redirect URI in Spotify and the one in code will cause login failures.

### Trivia (Gemini) backend

`quest-pass/src/services/gemini-quiz.js` posts to an external endpoint at `/api/quiz` (currently an absolute URL). Provide a reachable backend that accepts:

- Method: POST
- Body: `{ "artist": string }`
- Response: JSON array of quiz question objects

Tip: Consider using a relative path and a Vite dev proxy, or move the base URL into an env var like `VITE_API_BASE_URL`.

## Firebase Functions (optional but recommended)

Functions live in `quest-pass/functions/` and use Node 22.

### Local emulation

1) Set up a `.env` file for functions to supply the Jambase secret locally:

```
quest-pass/functions/.env

JAMBASE_KEY=your_jambase_api_key
```

2) Start the Functions emulator:

```
cd quest-pass/functions
npm install
npm run serve
```

The HTTP function URL will look like:

```
http://127.0.0.1:5001/<your-firebase-project>/us-central1/populateEventsFromJambase
```

Call it to populate Firestore with events and curated entries.

### Deploy to Firebase

1) Set the production secret once:

```
firebase functions:secrets:set JAMBASE_KEY
```

2) Deploy functions:

```
cd quest-pass/functions
npm run deploy
```

Note: This repository does not currently configure Firebase Hosting in `firebase.json`. You can add Hosting later to deploy the SPA, or deploy the frontend to Vercel/Netlify.

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
- CORS or 404 for `/api/quiz`: your trivia backend must exist and be reachable. Consider a Vite proxy in development.
- Firestore permission errors: verify Firebase rules and that you’re authenticated where required.
- Missing JAMBASE_KEY: set the secret in `.env` for emulators and with `firebase functions:secrets:set` for deploys.

## Roadmap / nice-to-haves

- Move hard-coded keys/URIs to Vite env vars with `.env.local` and `.env.production`
- Add Firebase Hosting config for a single-command deploy of the SPA
- Add basic tests and a CI workflow (build/lint) for PRs
- Add screenshots or a short demo GIF to this README

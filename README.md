# QuestPass 🎵🎟️

We are a group of students from Singapore Management University (SMU) working on a group project for the course of IS216 Web Application Development II (WAD2).

Our project Quest Pass is a Vue 3 + Vite single-page app that gamifies live events with quests and rewards. Users can **browse events**, **complete music quest** and **trivia quests**, play **mini games**, and **track progress** tied to their Firebase profile. 

A platform that lets fans **earn presale access codes** and **rewards** by completing interactive quests.

You can view the website here: https://questpass-b3680.web.app/

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Firebase CLI** - Install globally:
  ```bash
  npm install -g firebase-tools
  ```
- **Git** - [Download here](https://git-scm.com/)

### Required API Keys

You'll need to register and obtain API keys from the following services:

1. **Firebase** (Authentication, Firestore, Cloud Functions)
2. **JamBase API** (Event data)
3. **Google Gemini API** (AI-powered trivia generation)
4. **Google Maps API** (Venue location maps)
5. **EmailJS** (Email notifications)
6. **Spotify Web API** (Music discovery quest)
7. **Deezer API** (Mini Games; No key needed)

---

## 📋 Environment Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd questpass
```

### 2. Install Dependencies

```bash
# Install main project dependencies
npm install

# Install Firebase Functions dependencies
cd functions
npm install
cd ..
```

### 3. Configure Firebase

#### A. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable the following services:
   - **Authentication** (Email/Password provider)
   - **Firestore Database** (Start in production mode)
   - **Cloud Functions**
   - **Hosting**

#### B. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** > **General**
2. Scroll to "Your apps" and click the web icon `</>`
3. Register your app and copy the configuration object
4. Note down these values for your `.env` file

#### C. Set up Firebase locally

```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init

# Select:
# - Firestore
# - Functions
# - Hosting
```

### 4. Get API Keys

#### JamBase API
- Visit [JamBase API](https://apidocs.jambase.com/docs/jambase-api)
- Sign up for a developer account
- Navigate to your dashboard to get your API key
- **Cost**: Free tier available
- ⚠️ **Important**: Free trial API keys expire after 2 weeks. You'll need to request an extension or upgrade to continue using the service.

#### Google Gemini API
- Go to [Google AI Studio](https://aistudio.google.com/api-keys)
- Sign in with your Google account
- Click "Create API Key"
- Copy your API key
- **Cost**: Free tier with generous limits

#### Google Maps API
- Visit [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select existing one
- Enable these APIs:
  - Maps JavaScript API
  - Maps Embed API
  - Maps Static API
- Go to **Credentials** and create an API key
- **Cost**: $200 free credit monthly

#### EmailJS
- Sign up at [EmailJS](https://www.emailjs.com/)
- Create an email service (Gmail, Outlook, etc.)
- Create an email template
- Get your:
  - Service ID
  - Template ID
  - Public Key
- **Cost**: Free tier 
- ⚠️ **Important**: Free tier only allows up to 200 email requests. Once used up, new API is needed.

#### Spotify Web API (Optional - for Music Discovery Quest)
- Go to Spotify Developer Dashboard
- Log in with your Spotify account (create one if needed)
- Click "Create App"
- Fill in the app details:
  - App Name: QuestPass
  - App Description: Music discovery and event platform
  - Redirect URI: `http://localhost:3000/callback` (for local dev)
  - Add your production URL later: `https://your-domain.com/callback`
- Accept the Terms of Service
- Click "Create"
- Copy your:
  - Client ID
  - Client Secret
- Click "Edit Settings" and add all redirect URIs you'll use
- Cost: Free (with rate limits: 180 requests/minute)
- ⚠️ Note: Requires OAuth 2.0 implementation for user authorization

#### Deezer API (Used automatically - No key required)
- The app uses the public Deezer API for:
  - Artist images and metadata
  - Album cover art
  - Music catalog data for guessing games
- No API key required - completely free and open
- CORS Handling: The app uses `corsproxy.io` to bypass CORS restrictions
- Rate Limits:
  - Generous limits for free tier
  - No authentication needed for public endpoints
- Endpoints used:
  - `/chart/0/artists` - Popular artists
  - `/chart/0/tracks` - Popular tracks
  - /`artist/{id}/albums` - Artist's albums
- 📚 Documentation: Deezer API Docs


### 5. Create Environment Files

#### Root `.env` file

Create a `.env` file in the project root:

```env
# JamBase API
VITE_JAMBASE_API_KEY=your_jambase_api_key_here

# Google Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# EmailJS
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key

# Stripe (Optional - for future payment features)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_STRIPE_SECRET_KEY=your_stripe_secret_key
```

#### Firebase Functions `.env` file

Create a `functions/.env` file:

```env
VITE_JAMBASE_API_KEY=your_jambase_api_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### 6. Update Firebase Configuration

Edit `src/firebase.js` with your Firebase project configuration:

```javascript
export const firebaseConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
  measurementId: 'YOUR_MEASUREMENT_ID',
};
```

---

## 🎮 Running the Application

### Local Development Setup

#### Run with Live Firebase (Recommended)

This connects to your live Firebase project while developing locally:

```bash
# Start the Vite development server
npm run dev

# The app will be available at http://localhost:3000
```

### Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview

```

---

## 🚢 Deployment

### Deploy to Firebase Hosting

```bash
# Build and deploy
npm run build
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions
```

Your app will be live at: `https://YOUR_PROJECT_ID.web.app`

---

## 🎯 Features

### For Users
- 🎵 **Music Discovery Quest**: Connect Spotify to verify you've listened to an artist
- 🧠 **AI-Powered Trivia**: Test your knowledge with generated quizzes
- 🎟️ **Reward System**: Earn points to unlock presale access codes
- 🗺️ **Event Discovery**: Browse upcoming concerts with venue maps
- 📧 **Email Notifications**: Get notified when you unlock rewards

### For Developers
- ⚡ **Vue 3 + Vite**: Modern, fast development experience
- 🔥 **Firebase Backend**: Authentication, Firestore, Cloud Functions
- 🎨 **Bootstrap 5**: Responsive, accessible UI components
- 🤖 **AI Integration**: Gemini API for dynamic content generation
- 🎮 **Gamification**: Point-based progression system

---

## 📁 Project Structure

```
questpass/
├── src/
│   ├── components/        # Vue components
│   │   ├── AlbumGuess.vue
│   │   ├── CelebrityGuess.vue
│   │   ├── EventDetails.vue
│   │   ├── MusicQuest.vue
│   │   └── TriviaQuest.vue
│   ├── route/            # Vue Router configuration
│   ├── store/            # Pinia state management
│   ├── services/         # API service modules
│   ├── firebase.js       # Firebase initialization
│   ├── main.js          # App entry point
│   └── style.css        # Global styles
├── functions/           # Firebase Cloud Functions
│   ├── index.js        # Functions definitions
│   └── package.json
├── public/             # Static assets
├── .env                # Environment variables
├── firebase.json       # Firebase configuration
├── vite.config.js     # Vite configuration
└── package.json       # Project dependencies
```

---

## 🎨 Available Games

### 1. Album Guesser
Guess the album from a progressively revealed cover art. Earn up to 60 points based on how quickly you guess correctly.

### 2. Artist Guesser
Identify the artist from a blurred image that gets clearer with each attempt.

### 3. Music Heardle
Listen to song snippets and guess the track. The snippet gets longer with each wrong guess.

---

## 🔧 Troubleshooting

### Common Issues

**Build fails with API key errors**
- Ensure all environment variables are properly set in `.env`
- Restart the dev server after changing `.env` files

**Firebase deployment fails**
- Run `firebase login` to re-authenticate
- Check that your Firebase project is correctly initialized
- Ensure billing is enabled for Cloud Functions

**CORS errors with external APIs**
- The app uses `corsproxy.io` for Deezer API calls
- If issues persist, consider setting up your own CORS proxy

**Spotify integration not working**
- Spotify Web API requires separate OAuth setup
- This feature is optional and can be disabled

---

## 📝 License

This project is proprietary. All rights reserved.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📧 Support

For questions or issues:
- Open an issue on GitHub
- Contact the development team

---

## 🙏 Acknowledgments

- **JamBase** for event data
- **Google Gemini** for AI-powered trivia
- **Deezer API** for music metadata
- **Bootstrap** for UI components
- **Vue.js** community for excellent documentation

---

**Built with ❤️ by the QuestPass Team - Gorgeous Genius Glamorous Gracious Glowing Girls - THE 6Gs!**

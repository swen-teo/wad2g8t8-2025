import { defineStore } from 'pinia';
import { auth, db } from '@/firebase.js'; // Import from our firebase.js
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
// fix: remove useRouter, it's not reliable to use it inside a pinia store.
// We will call router.push() from the component *after* logout completes.

// // This is the "demo user" data from your app (2).js
// // We use this as a template for new users.
// const demoUserTemplate = {
//   id: 9999, // This will be replaced by Firebase UID
//   name: 'Jungkook',
//   email: 'demo@questpass.com',
//   spotifyConnected: true,
//   totalPoints: 888,
//   level: 9,
//   currentTier: 'Gold',
//   badges: ['First Quest', 'Quiz Master', 'Superfan'],
//   avatar:
//     'https://i.pinimg.com/474x/55/41/a6/5541a64a6e9c00ffaa0e552d7f102d62.jpg',
//   favoriteGenres: ['Pop', 'K-pop', 'Indie Rock'],
//   streakDays: 5,
//   joinDate: '2025-08-01',
//   completedQuests: 11,
//   purchasedTickets: 4,
//   activeQuests: [],
// };

function createDefaultUserProfile(user) {
  const now = new Date().toISOString().split('T')[0]; // e.g. "2025-10-28"
  return {
    id: user.uid,
    uid: user.uid,
    name: user.displayName || 'New User',
    email: user.email,
    avatar: user.photoURL || 'https://placehold.co/100x100?text=User',

    // Default progress fields (all fresh!)
    totalPoints: 0,
    level: 1,
    currentTier: 'Bronze',
    badges: ['First Quest'],

    favoriteGenres: [],
    streakDays: 1,
    joinDate: now,
    completedQuests: 0,
    levelProgress: 0,
    purchasedTickets: 0,
    activeQuests: [],
  };
}

// Define the store
export const useUserStore = defineStore('user', {
  // state() returns the initial state
  state: () => ({
    currentUser: null,
    loading: true, // Tracks if we are fetching the user
  }),

  // getters are like computed properties for stores
  getters: {
    isLoggedIn: (state) => !!state.currentUser,
    levelProgress: (state) => state.currentUser?.levelProgress ?? 0,
    currentTier: (state) => {
      // (This is from your app(2).js logic)
      const tiers = {
        Bronze: { bg: '#f0e6de', color: '#aa7a53' },
        Silver: { bg: '#eef0f2', color: '#8d9ca9' },
        Gold: { bg: '#fff6d9', color: '#a88c3a' },
      };
      return (
        tiers[state.currentUser?.currentTier] || {
          bg: '#eef0f2',
          color: '#8d9ca9',
        }
      );
    },
  },

  // actions are where we put methods that change the state
  actions: {
    /**
     * Fetches the user's profile from Firestore.
     * If it doesn't exist (e.g., new Google login), it creates one.
     */
    async fetchUserProfile(user) {
      if (!user) {
        this.currentUser = null;
        this.loading = false;
        return;
      }

      this.loading = true;
      const userDocRef = doc(db, 'users', user.uid);

      try {
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          // User profile exists, load it
          this.currentUser = { id: docSnap.id, ...docSnap.data() };
        } else {
          // // User profile doesn't exist (first-time login)
          // // Create one using their Google info and the demo template
          // console.log('User profile not found, creating a new one...');
          // const newUserProfile = {
          //   ...demoUserTemplate, // Use demo data as a base
          //   id: user.uid,
          //   uid: user.uid,
          //   email: user.email, // Use their actual email
          //   name: user.displayName || 'New User', // Use their Google display name
          //   avatar: user.photoURL || demoUserTemplate.avatar, // Use Google photo
          //   joinDate: new Date().toISOString().split('T')[0], // Set join date to today
          // };
          console.log('Creating new user profile for:', user.email);
          const newUserProfile = createDefaultUserProfile(user);

          // Save this new profile to Firestore
          await setDoc(userDocRef, newUserProfile);

          // Set the new profile as our current user
          this.currentUser = newUserProfile;
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        this.currentUser = null;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Logs the user out of Firebase and clears the local state.
     */
    async logout() {
      try {
        await signOut(auth); // Sign out from Firebase
        this.currentUser = null; // Clear the store
      } catch (error) {
        console.error('Error signing out:', error);
      }
    },

    /**
     * --- THIS IS THE MISSING FUNCTION ---
     * Clears the user from the store without logging out.
     * Used by the auth listener in App.vue when the user is logged out.
     */
    clearUser() {
      this.currentUser = null;
      this.loading = false;
    },

    /**
     * Adds `points` to the signed-in user's total points and persists it.
     * Accepts positive values only; silently ignores falsy/negative values.
     */
    async awardPoints(points) {
      if (!this.currentUser) return;
      const value = Number(points);
      if (!Number.isFinite(value) || value <= 0) return;

      const uid = this.currentUser.uid;
      if (!uid) return;

      const previousTotal = this.currentUser.totalPoints ?? 0;
      const newTotal = previousTotal + value;
      // Optimistically update the local store so the UI reacts immediately.
      this.currentUser = { ...this.currentUser, totalPoints: newTotal };

      const userDocRef = doc(db, 'users', uid);

      try {
        await updateDoc(userDocRef, {
          totalPoints: increment(value),
          lastPointsUpdate: serverTimestamp(),
        });
      } catch (error) {
        console.warn('Increment update failed, trying to merge setDoc:', error);
        try {
          await setDoc(
            userDocRef,
            {
              totalPoints: newTotal,
              lastPointsUpdate: serverTimestamp(),
            },
            { merge: true }
          );
        } catch (secondError) {
          console.error('Failed to persist points:', secondError);
          // Revert optimistic update if the write ultimately fails.
          this.currentUser = { ...this.currentUser, totalPoints: previousTotal };
          throw secondError;
        }
      }
    },
  },
});

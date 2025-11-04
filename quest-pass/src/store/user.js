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

const POINTS_PER_LEVEL = 500;

const DEFAULT_PROGRESS = calculateProgressFromPoints(0);

function determineTier(level) {
  if (level >= 21) return 'Gold';
  if (level >= 11) return 'Silver';
  return 'Bronze';
}

function calculateProgressFromPoints(totalPoints) {
  const safePoints = Math.max(0, Number(totalPoints) || 0);
  const level = Math.floor(safePoints / POINTS_PER_LEVEL) + 1;
  const pointsIntoLevel = safePoints % POINTS_PER_LEVEL;
  const progressPercentage = Math.floor(
    (pointsIntoLevel / POINTS_PER_LEVEL) * 100
  );

  return {
    level,
    currentTier: determineTier(level),
    levelProgress: progressPercentage,
    pointsIntoLevel,
    pointsPerLevel: POINTS_PER_LEVEL,
    pointsToNextLevel: POINTS_PER_LEVEL - pointsIntoLevel,
  };
}

function applyProgressFields(profile) {
  const progress = calculateProgressFromPoints(profile.totalPoints);
  return {
    ...profile,
    ...progress,
  };
}

function createDefaultUserProfile(user) {
  const now = new Date().toISOString().split('T')[0]; // e.g. "2025-10-28"
  return applyProgressFields({
    id: user.uid,
    uid: user.uid,
    name: user.displayName || 'New User',
    email: user.email,
    avatar: user.photoURL || 'https://placehold.co/100x100?text=User',

    // Default progress fields (all fresh!)
    totalPoints: 0,
    badges: ['First Quest'],

    favoriteGenres: [],
    streakDays: 1,
    joinDate: now,
    completedQuests: 0,
    purchasedTickets: 0,
    activeQuests: [],
    hasSeenInstructions: false,
  });
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
    progressSnapshot(state) {
      if (!state.currentUser) {
        return { ...DEFAULT_PROGRESS };
      }

      return calculateProgressFromPoints(state.currentUser.totalPoints);
    },
    levelProgress() {
      return this.progressSnapshot.levelProgress;
    },
    pointsIntoLevel() {
      return this.progressSnapshot.pointsIntoLevel;
    },
    pointsToNextLevel() {
      return this.progressSnapshot.pointsToNextLevel;
    },
    pointsPerLevel() {
      return this.progressSnapshot.pointsPerLevel;
    },
    currentTier(state) {
      // (This is from your app(2).js logic)
      const tiers = {
        Bronze: { bg: '#f0e6de', color: '#aa7a53' },
        Silver: { bg: '#eef0f2', color: '#8d9ca9' },
        Gold: { bg: '#fff6d9', color: '#a88c3a' },
      };
      const tierName =
        state.currentUser?.currentTier || this.progressSnapshot.currentTier;
      return (
        tiers[tierName] || {
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
          const data = docSnap.data();

          if (data.hasSeenInstructions === undefined) {
            try {
              await updateDoc(userDocRef, { hasSeenInstructions: true });
              data.hasSeenInstructions = true;
            } catch (updateError) {
              console.error('Error updating instruction flag:', updateError);
              data.hasSeenInstructions = true;
            }
          }

          const profileWithProgress = applyProgressFields({
            id: docSnap.id,
            ...data,
          });

          const progressUpdates = {};
          if (data.level !== profileWithProgress.level) {
            progressUpdates.level = profileWithProgress.level;
          }
          if (data.currentTier !== profileWithProgress.currentTier) {
            progressUpdates.currentTier = profileWithProgress.currentTier;
          }
          if (data.levelProgress !== profileWithProgress.levelProgress) {
            progressUpdates.levelProgress = profileWithProgress.levelProgress;
          }
          if (data.pointsIntoLevel !== profileWithProgress.pointsIntoLevel) {
            progressUpdates.pointsIntoLevel = profileWithProgress.pointsIntoLevel;
          }
          if (data.pointsToNextLevel !== profileWithProgress.pointsToNextLevel) {
            progressUpdates.pointsToNextLevel = profileWithProgress.pointsToNextLevel;
          }
          if (data.pointsPerLevel !== profileWithProgress.pointsPerLevel) {
            progressUpdates.pointsPerLevel = profileWithProgress.pointsPerLevel;
          }

          if (Object.keys(progressUpdates).length > 0) {
            try {
              await updateDoc(userDocRef, progressUpdates);
            } catch (progressError) {
              console.error('Error syncing progress fields:', progressError);
            }
          }

          this.currentUser = profileWithProgress;
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

    async markInstructionsSeen() {
      if (!this.currentUser) return;

      const userDocRef = doc(db, 'users', this.currentUser.uid || this.currentUser.id);

      try {
        await updateDoc(userDocRef, { hasSeenInstructions: true });
        this.currentUser = {
          ...this.currentUser,
          hasSeenInstructions: true,
        };
      } catch (error) {
        console.error('Error marking instructions as seen:', error);
      }
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
      const updatedProfile = applyProgressFields({
        ...this.currentUser,
        totalPoints: newTotal,
      });

      // Optimistically update the local store so the UI reacts immediately.
      this.currentUser = updatedProfile;

      const userDocRef = doc(db, 'users', uid);

      try {
        await updateDoc(userDocRef, {
          totalPoints: increment(value),
          level: updatedProfile.level,
          currentTier: updatedProfile.currentTier,
          levelProgress: updatedProfile.levelProgress,
          pointsIntoLevel: updatedProfile.pointsIntoLevel,
          pointsToNextLevel: updatedProfile.pointsToNextLevel,
          pointsPerLevel: updatedProfile.pointsPerLevel,
          lastPointsUpdate: serverTimestamp(),
        });
      } catch (error) {
        console.warn('Increment update failed, trying to merge setDoc:', error);
        try {
          await setDoc(
            userDocRef,
            {
              totalPoints: newTotal,
              level: updatedProfile.level,
              currentTier: updatedProfile.currentTier,
              levelProgress: updatedProfile.levelProgress,
              pointsIntoLevel: updatedProfile.pointsIntoLevel,
              pointsToNextLevel: updatedProfile.pointsToNextLevel,
              pointsPerLevel: updatedProfile.pointsPerLevel,
              lastPointsUpdate: serverTimestamp(),
            },
            { merge: true }
          );
        } catch (secondError) {
          console.error('Failed to persist points:', secondError);
          // Revert optimistic update if the write ultimately fails.
          this.currentUser = applyProgressFields({
            ...this.currentUser,
            totalPoints: previousTotal,
          });
          throw secondError;
        }
      }
    },
  },
});

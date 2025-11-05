import { defineStore } from 'pinia';
import { auth, db } from '@/firebase.js';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const POINTS_PER_LEVEL = 500;

const MINI_GAME_FACTORIES = Object.freeze({
  heardle: () => ({
    gamesPlayed: 0,
    totalPointsEarned: 0,
    lastScore: 0,
    bestScore: 0,
    lastOutcome: null,
    lastAttempts: null,
    lastPlayedAtIso: null,
  }),
});

function createMiniGameDefaultState() {
  return Object.fromEntries(
    Object.entries(MINI_GAME_FACTORIES).map(([key, factory]) => [key, factory()])
  );
}

function ensureMiniGameStructure(profile = {}) {
  const defaults = createMiniGameDefaultState();
  const stored = profile?.miniGames ?? {};
  const normalized = { ...stored };

  for (const [key, defaultValue] of Object.entries(defaults)) {
    normalized[key] = {
      ...defaultValue,
      ...(stored[key] ?? {}),
    };
  }

  // Preserve any additional mini games stored in Firestore that we don't know about yet.
  for (const [key, value] of Object.entries(stored)) {
    if (!normalized[key]) {
      normalized[key] = value;
    }
  }

  return {
    ...profile,
    miniGames: normalized,
  };
}

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
  const normalizedProfile = ensureMiniGameStructure(profile);
  const progress = calculateProgressFromPoints(normalizedProfile.totalPoints);
  return {
    ...normalizedProfile,
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
    joinDate: now,
    completedQuests: 0,
    hasSeenInstructions: false,
    miniGames: createMiniGameDefaultState(),
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
    // Loads the user's profile from Firestore or creates a default record for new accounts.
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

          const storedMiniGames = data.miniGames ?? {};
          const miniGameUpdates = Object.fromEntries(
            Object.entries(profileWithProgress.miniGames ?? {}).filter(
              ([key]) => storedMiniGames[key] === undefined
            )
          );

          if (Object.keys(miniGameUpdates).length > 0) {
            try {
              await setDoc(
                userDocRef,
                { miniGames: miniGameUpdates },
                { merge: true }
              );
            } catch (miniGameError) {
              console.error('Error syncing mini-game defaults:', miniGameError);
            }
          }

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

    // Logs the user out of Firebase and clears the local state.
    async logout() {
      try {
        await signOut(auth); // Sign out from Firebase
        this.currentUser = null; // Clear the store
      } catch (error) {
        console.error('Error signing out:', error);
      }
    },

    // Clears the user from the store without signing them out (used by the auth listener).
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

    // Adds positive points to the signed-in user's profile and syncs progress to Firestore.
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

    async recordMiniGameResult(gameKey, session = {}) {
      if (!this.currentUser?.uid) return;

      const normalizedKey = typeof gameKey === 'string' ? gameKey.trim() : '';
      if (!normalizedKey) return;

      const toIsoString = (value) => {
        if (!value) return null;
        if (value instanceof Date) return value.toISOString();
        if (typeof value === 'string') {
          const parsed = new Date(value);
          return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
        }
        if (typeof value === 'number' && Number.isFinite(value)) {
          const parsed = new Date(value);
          return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
        }
        return null;
      };

      const numericPoints = Number(session.pointsEarned);
      const pointsEarned = Number.isFinite(numericPoints) ? numericPoints : 0;
      const attemptCountRaw = Number(session.attemptCount);
      const attemptCount = Number.isFinite(attemptCountRaw) ? attemptCountRaw : null;
      const completedAtIso =
        toIsoString(session.completedAt ?? session.completedAtIso) ?? new Date().toISOString();
      const sessionStartedIso = toIsoString(session.sessionStartedAt ?? session.startedAt) ?? null;
      const outcome =
        session.outcome || (pointsEarned > 0 ? 'win' : session.outcome === '' ? '' : 'loss');

      const attemptsList = Array.isArray(session.attempts)
        ? session.attempts.map((attempt) => ({
            id: attempt?.id ?? null,
            title: attempt?.title ?? null,
            artist: attempt?.artist ?? null,
            isCorrect: attempt?.isCorrect === true,
          }))
        : [];

      const answer = session.answer
        ? {
            id: session.answer.id ?? null,
            title: session.answer.title ?? null,
            artist: session.answer.artist ?? null,
          }
        : null;

      const currentStats =
        this.currentUser.miniGames?.[normalizedKey] ??
        (MINI_GAME_FACTORIES[normalizedKey]?.() || {
          gamesPlayed: 0,
          totalPointsEarned: 0,
          lastScore: 0,
          bestScore: 0,
          lastOutcome: null,
          lastAttempts: null,
          lastPlayedAtIso: null,
        });

      const updatedStats = {
        ...currentStats,
        gamesPlayed: (Number(currentStats.gamesPlayed) || 0) + 1,
        totalPointsEarned:
          (Number(currentStats.totalPointsEarned) || 0) + Math.max(pointsEarned, 0),
        lastScore: pointsEarned,
        bestScore: Math.max(Number(currentStats.bestScore) || 0, pointsEarned),
        lastOutcome: outcome,
        lastAttempts: attemptCount ?? currentStats.lastAttempts ?? null,
        lastPlayedAtIso: completedAtIso,
      };

      const updatedProfile = ensureMiniGameStructure({
        ...this.currentUser,
        miniGames: {
          ...(this.currentUser.miniGames ?? {}),
          [normalizedKey]: updatedStats,
        },
      });

      this.currentUser = updatedProfile;

      const userDocRef = doc(db, 'users', this.currentUser.uid);

      try {
        await setDoc(
          userDocRef,
          {
            miniGames: {
              [normalizedKey]: {
                ...updatedStats,
                lastPlayedAtServer: serverTimestamp(),
              },
            },
          },
          { merge: true }
        );
      } catch (error) {
        console.error('Failed to update mini-game stats:', error);
      }

      try {
        await addDoc(collection(db, 'users', this.currentUser.uid, 'miniGameSessions'), {
          gameKey: normalizedKey,
          pointsEarned,
          outcome,
          attemptCount,
          attempts: attemptsList,
          answer,
          sessionStartedAtIso,
          completedAtIso,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Failed to log mini-game session:', error);
      }
    },
  },
});

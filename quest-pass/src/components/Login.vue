<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/firebase.js';
// we don't need the store here, since App.vue handles the login state

// --- state ---
const loginForm = ref({ email: '', password: '' });
const isLoading = ref(false); // one loading state for both buttons
const error = ref(null); // holds any firebase error messages

// --- services ---
const router = useRouter();
const route = useRoute();
const googleProvider = new GoogleAuthProvider();

// --- methods ---

/**
 * this handles the main email/password login
 */
async function handleLogin() {
  if (isLoading.value) return; // don't let the user double-click
  isLoading.value = true;
  error.value = null;

  try {
    // try to sign in with firebase auth
    await signInWithEmailAndPassword(
      auth,
      loginForm.value.email,
      loginForm.value.password
    );
    // if it works, the listener in app.vue will see it
    // and the router will redirect us away.
    // we don't even need to redirect here, but we can.
    // prefer redirect query if present (user tried to access a protected route)
    const redirect = route.query.redirect || { name: 'Home' };
    router.push(redirect);
  } catch (err) {
    // handle firebase errors
    switch (err.code) {
      case 'auth/user-not-found':
        error.value = 'no account found with that email.';
        break;
      case 'auth/wrong-password':
        error.value = 'incorrect password. please try again.';
        break;
      case 'auth/invalid-credential':
        error.value = 'invalid email or password.';
        break;
      default:
        error.value = 'an error occurred. please try again.';
    }
  } finally {
    // no matter what, stop loading
    isLoading.value = false;
  }
}

/**
 * this handles the "login with google" popup
 */
async function handleGoogleLogin() {
  if (isLoading.value) return;
  isLoading.value = true;
  error.value = null;

  try {
    // open the google popup
    await signInWithPopup(auth, googleProvider);
    // just like before, app.vue will handle the state
    const redirect = route.query.redirect || { name: 'Home' };
    router.push(redirect);
  } catch (err) {
    // user might have closed the popup
    if (err.code !== 'auth/popup-closed-by-user') {
      error.value = 'failed to sign in with google.';
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="container-fluid vh-100 login-bg">
    <div class="row h-100 align-items-center justify-content-center">
      <div class="col-md-6 col-lg-4">
        <!-- decorative animated background layer -->
        <div class="bg-sparkles" aria-hidden="true">
          <!-- The dots layer from your original styles -->
          <div class="dots"></div>
          <!-- New falling stars layer -->
          <div class="falling-stars">
            <div class="star">★</div>
            <div class="star">★</div>
            <div class="star">★</div>
            <div class="star">★</div>
            <div class="star">★</div>
          </div>
        </div>
        <!-- your sparkle animation container can go here -->

        <div class="card shadow-lg border-0" style="border-radius: 1rem">
          <div class="card-body p-4 p-md-5 text-center">
            <i class="fas fa-ticket-alt fa-3x text-primary-1 mb-4"></i>
            <h1 class="fw-bold mb-3">Welcome Back</h1>
            <p class="text-muted mb-4">Log in to continue your quest.</p>

            <!-- email/password form -->
            <form @submit.prevent="handleLogin">
              <div class="form-floating mb-3">
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  placeholder="name@example.com"
                  v-model="loginForm.email"
                  required
                />
                <label for="email">Email address</label>
              </div>

              <div class="form-floating mb-3">
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  placeholder="Password"
                  v-model="loginForm.password"
                  required
                />
                <label for="password">Password</label>
              </div>

              <!-- this is the error message display -->
              <div
                v-if="error"
                class="alert alert-danger py-2"
                role="alert"
              >
                {{ error }}
              </div>

              <div class="d-grid mb-3">
                <button
                  class="btn btn-primary btn-lg fw-bold"
                  type="submit"
                  :disabled="isLoading"
                >
                  <span
                    v-if="isLoading"
                    class="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  <span v-else>Login</span>
                </button>
              </div>

              <hr class="my-4" />

              <!-- 
                show/hide the spinner and text.
              -->
              <div class="d-grid">
                <button
                  class="btn btn-outline-secondary btn-lg"
                  type="button"
                  @click="handleGoogleLogin"
                  :disabled="isLoading"
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google icon"
                    style="width: 20px; height: 20px; margin-right: 10px"
                  />
                  <!-- 
                    v-if="isLoading" on the spinner
                    and v-if="!isLoading" on the text.
                  -->
                  <span
                    v-if="isLoading"
                    class="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  <span v-if="!isLoading">Login with Google</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
/* Login background: animated gradient + floating soft blobs */
.login-bg {
  position: relative;
  overflow: hidden;
  /* animated multi-stop gradient */
  background: linear-gradient(120deg, #f8f9fa 0%, #e9f0ff 30%, #fff6f9 60%, #f8f9fa 100%);
  background-size: 300% 300%;
  animation: gradientShift 12s ease infinite;
}

.bg-sparkles {
  position: absolute;
  inset: 0; /* top/right/bottom/left: 0 */
  pointer-events: none;
  z-index: 0; /* sit behind the card content */
  mix-blend-mode: normal;
}

/* soft colored blob layers using pseudo elements */
.bg-sparkles::before,
.bg-sparkles::after {
  content: "";
  position: absolute;
  filter: blur(40px) saturate(120%);
  opacity: 0.55;
  transform: translate3d(0,0,0);
}

.bg-sparkles::before {
  width: 50vmax;
  height: 50vmax;
  left: -10vmax;
  top: -20vmax;
  background: radial-gradient(circle at 30% 30%, rgba(99,102,241,0.18), transparent 30%),
              radial-gradient(circle at 70% 70%, rgba(56,189,248,0.12), transparent 30%);
  animation: floatSlow 10s ease-in-out infinite alternate;
}

.bg-sparkles::after {
  width: 40vmax;
  height: 40vmax;
  right: -12vmax;
  bottom: -18vmax;
  background: radial-gradient(circle at 20% 20%, rgba(236,72,153,0.12), transparent 30%),
              radial-gradient(circle at 80% 80%, rgba(99,102,241,0.08), transparent 30%);
  animation: floatSlow 14s ease-in-out infinite alternate-reverse;
}

/* tiny sparkle dots layer using repeating-radial-gradient */
.bg-sparkles > .dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 2% 10%, rgba(255,255,255,0.9) 1px, transparent 1px),
                    radial-gradient(circle at 60% 30%, rgba(255,255,255,0.6) 1px, transparent 1px);
  background-size: 140px 140px, 220px 220px;
  opacity: 0.06;
  animation: dotsMove 20s linear infinite;
}

/* ensure falling stars sit above soft blobs but behind the card */
.bg-sparkles .falling-stars {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 1;
  mix-blend-mode: screen; /* make stars pop against background */
  pointer-events: none;
}

/* ensure the card content sits above the effects */
.card {
  position: relative;
  z-index: 2; /* ensure the card sits above stars and blobs */
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes floatSlow {
  from { transform: translateY(-6%) rotate(-2deg) scale(1); }
  to { transform: translateY(6%) rotate(2deg) scale(1.02); }
}

@keyframes dotsMove {
  from { transform: translateY(0); }
  to { transform: translateY(-40px); }
}

/* --- ADDED FOR FALLING STARS --- */
/* Falling stars: brighter, glowing streaks that sit above blobs */
.star {
  position: absolute;
  top: -8vh; /* start above viewport */
  font-size: 18px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 0 8px rgba(255,255,255,0.9), 0 0 18px rgba(255,255,255,0.6);
  transform: translateY(0) rotate(0deg);
  animation: starFall linear infinite;
  will-change: transform, opacity;
}

@keyframes starFall {
  from {
    transform: translateY(-8vh) rotate(0deg) scale(1);
    opacity: 1;
  }
  to {
    transform: translateY(110vh) rotate(360deg) scale(0.95);
    opacity: 0.85;
  }
}

/* Add variety to the stars for a more natural look */
.falling-stars .star:nth-child(1) {
  left: 6%;
  animation-duration: 3.6s;
  animation-delay: -1.2s;
  font-size: 20px;
}
.falling-stars .star:nth-child(2) {
  left: 26%;
  animation-duration: 2.8s;
  animation-delay: -2.1s;
  font-size: 16px;
}
.falling-stars .star:nth-child(3) {
  left: 46%;
  animation-duration: 4.4s;
  animation-delay: -0.6s;
  font-size: 18px;
}
.falling-stars .star:nth-child(4) {
  left: 66%;
  animation-duration: 2.4s;
  animation-delay: -3.0s;
  font-size: 22px;
}
.falling-stars .star:nth-child(5) {
  left: 86%;
  animation-duration: 3.8s;
  animation-delay: -3.8s;
  font-size: 17px;
}
/* --- END OF FALLING STARS --- */

</style>

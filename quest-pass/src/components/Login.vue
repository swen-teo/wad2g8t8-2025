<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
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
    router.push('/');
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
    router.push('/');
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
  <div class="container-fluid vh-100" style="background-color: #f8f9fa">
    <div class="row h-100 align-items-center justify-content-center">
      <div class="col-md-6 col-lg-4">
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

              <!-- 
                fix: here is the corrected login button.
                the v-if and v-else spans are direct siblings,
                so vue will correctly toggle between them.
              -->
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
                fix: same logic for the google button.
                we just show/hide the spinner and text.
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
                    we use v-if="isLoading" on the spinner
                    and v-if="!isLoading" on the text.
                    this is just another way to write v-if/v-else.
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
/* your login-page.html styles can go here */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
</style>


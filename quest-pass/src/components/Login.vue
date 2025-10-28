<template>
  <div>
    <!-- Sparkle animation container from login-page.html -->
    <div
      class="sparkle-container"
      ref="sparkleContainerRef"
    ></div>

    <div class="container-fluid bg-light-gradient vh-100">
      <div class="row h-100 align-items-center justify-content-center">
        <!-- Left Side: Instructions -->
        <div class="col-lg-7 d-none d-lg-block p-5">
          <h2 class="display-5 fw-bold mb-4">
            Unlock Your Fandom.
          </h2>
          <p class="lead text-muted mb-5">
            Turn your passion into points. Complete quests related to your
            favorite artists and events.
          </p>
          <div class="row instructions-row g-4">
            <div class="col-md-4">
              <div class="card h-100 shadow-sm border-0">
                <div class="card-body text-center p-4">
                  <i
                    class="fas fa-search-location fa-3x text-primary-1 mb-3"
                  ></i>
                  <h5 class="fw-bold">1. Find Events</h5>
                  <p class="small text-muted">
                    Browse upcoming shows and events.
                  </p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card h-100 shadow-sm border-0">
                <div class="card-body text-center p-4">
                  <i
                    class="fas fa-tasks fa-3x text-primary-2 mb-3"
                  ></i>
                  <h5 class="fw-bold">2. Complete Quests</h5>
                  <p class="small text-muted">
                    Take quizzes, check in, or listen to music.
                  </p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card h-100 shadow-sm border-0">
                <div class="card-body text-center p-4">
                  <i class="fas fa-trophy fa-3x text-success mb-3"></i>
                  <h5 class="fw-bold">3. Earn Rewards</h5>
                  <p class="small text-muted">
                    Unlock exclusive perks and access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Login Form -->
        <div class="col-lg-5 p-5">
          <div
            class="card shadow-lg border-0"
            style="border-radius: 1.5rem"
          >
            <div class="card-body p-5 text-center">
              <i
                class="fas fa-ticket-alt fa-3x text-primary-1 mb-4"
              ></i>
              <h1 class="fw-bold mb-3">Welcome Back</h1>
              <p class="text-muted mb-4">
                Log in to continue your quest.
              </p>

              <!-- Login form wired up with Vue -->
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

                <div
                  class="d-flex justify-content-between align-items-center mb-4"
                >
                  <a
                    href="#"
                    class="text-muted small text-decoration-none"
                    >Forgot password?</a
                  >
                </div>

                <div class="d-grid">
                  <button
                    class="btn btn-primary btn-lg fw-bold"
                    type="submit"
                  >
                    Login
                  </button>
                </div>
              </form>

              <hr class="my-4" />

              <p class="text-muted">
                Don't have an account?
                <a
                  href="#"
                  class="text-primary-1 fw-bold text-decoration-none"
                  >Register here</a
                >
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// You will need to create this store to manage the user's login state
// import { useUserStore } from '@/store/user';

// --- State ---
// This comes from the data() in app.js
const loginForm = ref({ email: '', password: '' });
const sparkleContainerRef = ref(null); // Ref for the animation container

// --- Router & Store ---
const router = useRouter();
// const userStore = useUserStore(); // Uncomment when you create your Pinia store

// --- Methods ---
/**
 * Handles the form submission.
 */
function handleLogin() {
  console.log('Attempting login with:', loginForm.value);

  // --- Real-world logic would go here ---
  // 1. Call your Pinia store action:
  //    await userStore.login(loginForm.value.email, loginForm.value.password);
  //
  // 2. The store would make an API call.
  // 3. If successful, redirect to the home page.

  // --- For now, we'll simulate a login and redirect ---
  // In a real app, you'd get the user from the store:
  // userStore.currentUser = userStore.demoUser;
  console.log('Simulating successful login...');

  // Redirect to the home page ('/') after login
  router.push('/');
}

// --- Lifecycle Hooks ---
/**
 * Runs the sparkle animation script from login-page.html
 * once the component is mounted to the DOM.
 */
onMounted(() => {
  if (sparkleContainerRef.value) {
    const container = sparkleContainerRef.value;
    const color1 = '#a78bfa'; // --primary-1
    const color2 = '#60a5fa'; // --primary-2
    const numSparkles = 50;

    for (let i = 0; i < numSparkles; i++) {
      const sparkle = document.createElement('i');
      sparkle.className = 'fas fa-star sparkle';

      const randomDuration = 5 + Math.random() * 5; // 5-10 seconds
      const randomStartOffset = Math.random() * randomDuration;

      sparkle.style.left = `${Math.random() * 100}%`;
      sparkle.style.top = `${-Math.random() * 1}%`;
      sparkle.style.animationDuration = `${randomDuration}s`;
      sparkle.style.animationDelay = `${-randomStartOffset}s`;

      sparkle.style.color = Math.random() > 0.5 ? color1 : color2;
      container.appendChild(sparkle);
    }
  }
});
</script>

<style scoped>
/* Styles copied directly from login-page.html */

/* Dim sibling cards when one card is hovered or focused */
.instructions-row .card {
  transition:
    filter 0.35s cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 0.28s cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.instructions-row:hover .card {
  filter: brightness(0.85) saturate(0.95);
}
.instructions-row .card:hover,
.instructions-row .card:focus-within {
  filter: none;
  transform: translateY(-6px);
  box-shadow:
    0 18px 34px rgba(167, 139, 250, 0.15),
    0 14px 22px rgba(167, 139, 250, 0.1);
}

/* Background gradient */
.bg-light-gradient {
  background: linear-gradient(
    135deg,
    rgba(239, 234, 255, 0.3) 0%,
    rgba(243, 233, 255, 0.7) 100%
  );
}

/* Sparkle animation */
.sparkle-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

/* 
    deep() applies animations
*/
:deep(.sparkle) {
  position: absolute;
  font-size: 10px;
  opacity: 0;
  animation: fall 10s linear infinite;
  text-shadow:
    0 0 5px currentColor,
    0 0 10px currentColor;
}

@keyframes fall {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: 0.8;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(105vh) rotate(360deg);
    opacity: 0;
  }
}
</style>
<template>
  <nav class="navbar navbar-expand-lg navbar-light sticky-top">
    <div class="container">
      <router-link
        class="navbar-brand fw-bold"
        :to="userStore.isLoggedIn ? { name: 'Home' } : { name: 'LandingPage' }"
      >
        <font-awesome-icon :icon="['fas','ticket-alt']" class="me-2" />QuestPass
      </router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div
        class="collapse navbar-collapse"
        id="navbarNav"
      >
        <!-- Logged-in links -->
        <ul
          class="navbar-nav me-auto"
          v-if="userStore.isLoggedIn"
        >
          <li class="nav-item">
            <router-link
              class="nav-link d-flex align-items-center"
              active-class="active"
              :to="{ name: 'Home' }"
            >
              <font-awesome-icon :icon="['fas','calendar-alt']" class="me-2" />
              <span>Events</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              class="nav-link d-flex align-items-center"
              active-class="active"
              to="/profile"
            >
              <font-awesome-icon :icon="['fas','user']" class="me-2" />
              <span>Profile</span>
            </router-link>
          </li>
        </ul>

        <!-- User Dropdown (Logged In) -->
        <!-- 
          FIX: Changed v-if="userStore.isLoggedIn" to v-if="userStore.currentUser"
          This prevents an error when Vue tries to render 'userStore.currentUser.name'
          before the currentUser object has been loaded from Firestore.
        -->
        <ul
          class="navbar-nav ms-auto"
          v-if="userStore.currentUser"
        >
          <li class="nav-item me-2 d-flex align-items-center">
            <span class="navbar-text d-flex align-items-center">
              <i class = "fas fa-star text-warning me-1"></i>
              <!-- This was already safe, but it's good practice -->
              <span class="fw-semibold">{{ userStore.currentUser?.totalPoints ?? 0 }}</span>
              <span class="ms-1 text-muted small">PTS</span>
            </span>
          </li>
          <li class="nav-item dropdown">
            <button
              class="nav-link dropdown-toggle d-flex align-items-center btn btn-link"
              id="navbarUserDropdown"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              ref="userDropdownToggle"
            >
              <img
                :src="(userStore.currentUser && userStore.currentUser.avatar) || 'https://placehold.co/30/a78bfa/ffffff?text=U'"
                class="rounded-circle me-2"
                width="30"
                height="30"
                alt="User Avatar"
                style ="object-fit: cover"
              />
              <!-- This is now safe because of the parent v-if -->
              <span class="d-none d-sm-inline">{{ userStore.currentUser.name }}</span>
            </button>
            <ul
              class="dropdown-menu dropdown-menu-end"
              aria-labelledby="navbarUserDropdown"
            >
              <li>
                <router-link
                  class="dropdown-item d-flex align-items-center"
                  to="/profile"
                >
                  <font-awesome-icon :icon="['fas','user']" class="me-2" />
                  My Profile
                </router-link>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <a
                  class="dropdown-item"
                  href="#"
                  @click.prevent="handleLogout"
                  >Logout</a
                >
              </li>
            </ul>
          </li>
        </ul>

        <!-- Login Button (Logged Out) -->
        <ul
          class="navbar-nav ms-auto"
          v-if="!userStore.isLoggedIn && !userStore.loading"
        >
          <li class="nav-item">
            <router-link
              class="btn btn-primary"
              to="/login"
              >Login / Sign Up</router-link
            >
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>

import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();


// This replaces the logout() method from app.js
async function handleLogout() {
  await userStore.logout();
  // navigate to the named Login route
  router.push({ name: 'Login' });
}
</script>

<style scoped>
/* Add a subtle style for the active link */
.nav-link.active {
  font-weight: 600;
  color: var(--primary-1) !important;
}
</style>
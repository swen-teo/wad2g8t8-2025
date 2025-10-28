<template>
  <nav class="navbar navbar-expand-lg navbar-light sticky-top">
    <div class="container">
      <router-link class="navbar-brand fw-bold" to="/">
        <i class="fas fa-ticket-alt me-2"></i>QuestPass
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
              class="nav-link"
              active-class="active"
              to="/"
              >Events</router-link
            >
          </li>
          <li class="nav-item">
            <router-link
              class="nav-link"
              active-class="active"
              to="/profile"
              >Profile</router-link
            >
          </li>
        </ul>

        <!-- User Dropdown (Logged In) -->
        <ul
          class="navbar-nav ms-auto"
          v-if="userStore.currentUser"
        >
          <li class="nav-item me-2 d-flex align-items-center">
            <span class="navbar-text d-flex align-items-center">
              <i class="fas fa-star text-warning me-1"></i>
              <span class="fw-semibold">{{ userStore.currentUser?.totalPoints ?? 0 }}</span>
              <span class="ms-1 text-muted small">PTS</span>
            </span>
          </li>
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle d-flex align-items-center"
              href="#"
              id="navbarUserDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img
                :src="(userStore.currentUser && userStore.currentUser.avatar) || 'https://placehold.co/30/a78bfa/ffffff?text=U'"
                class="rounded-circle me-2"
                width="30"
                height="30"
                alt="User Avatar"
              />
              {{ userStore.currentUser.name }}
            </a>
            <ul
              class="dropdown-menu dropdown-menu-end"
              aria-labelledby="navbarUserDropdown"
            >
              <li>
                <router-link
                  class="dropdown-item"
                  to="/profile"
                  >My Profile</router-link
                >
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
  router.push('/login');
}
</script>

<style scoped>
/* Add a subtle style for the active link */
.nav-link.active {
  font-weight: 600;
  color: var(--primary-1) !important;
}
</style>
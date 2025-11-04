<template>
  <nav class="navbar navbar-expand-lg navbar-light sticky-top">
    <div class="container">
      <router-link
        class="navbar-brand fw-bold"
        :to="{ name: 'LandingPage' }"
      >
        <font-awesome-icon :icon="['fas','ticket-alt']" class="me-2" />QuestPass
      </router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
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
              :to="{ name: 'MiniGames' }"
            >
              <font-awesome-icon :icon="['fas','puzzle-piece']" class="me-2" />
              <span>Mini Games</span>
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
          <li class="nav-item dropdown">
            <button
              class="nav-link dropdown-toggle d-flex align-items-center btn btn-link gap-2 user-dropdown-toggle"
              id="navbarUserDropdown"
              type="button"
              :aria-expanded="isDropdownOpen"
              ref="userDropdownToggle"
              @click.stop="toggleDropdown"
            >
              <img
                :src="(userStore.currentUser && userStore.currentUser.avatar) || 'https://placehold.co/30/a78bfa/ffffff?text=U'"
                class="rounded-circle me-2"
                width="30"
                height="30"
                alt="User Avatar"
                style ="object-fit: cover"
              />
              <span class="user-meta d-inline-flex align-items-center gap-2">
                <span class="user-name fw-semibold text-nowrap text-truncate">
                  {{ userStore.currentUser.name }}
                </span>
                <span class="user-points d-inline-flex align-items-center gap-1">
                  <font-awesome-icon :icon="['fas','star']" class="user-points-icon" />
                  <span class="user-points-value">{{ userStore.currentUser?.totalPoints ?? 0 }}</span>
                  <span class="text-uppercase user-points-label">pts</span>
                </span>
              </span>
            </button>
            <ul
              class="dropdown-menu dropdown-menu-end"
              aria-labelledby="navbarUserDropdown"
              ref="userDropdownMenu"
              :class="{ show: isDropdownOpen }"
              v-show="isDropdownOpen"
              @click.stop
            >
              <li>
                <router-link
                  class="dropdown-item d-flex align-items-center"
                  to="/profile"
                  @click="closeDropdown"
                >
                  <font-awesome-icon :icon="['fas','user']" class="me-2" />
                  My Profile
                </router-link>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <a
                  class="dropdown-item logout-item d-flex align-items-center"
                  href="#"
                  @click.prevent="() => { closeDropdown(); handleLogout(); }"
                  >
                  <font-awesome-icon
                    :icon="['fas', 'sign-out-alt']"
                    class="me-2"
                  />
                  Logout
                </a
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

import { onBeforeUnmount, onMounted, ref } from 'vue';

const userStore = useUserStore();
const router = useRouter();

const isDropdownOpen = ref(false);
const userDropdownToggle = ref(null);
const userDropdownMenu = ref(null);

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value;
}

function closeDropdown() {
  isDropdownOpen.value = false;
}

function handleDocumentClick(event) {
  const toggleEl = userDropdownToggle.value;
  const menuEl = userDropdownMenu.value;

  if (!toggleEl || !menuEl) {
    return;
  }

  if (!toggleEl.contains(event.target) && !menuEl.contains(event.target)) {
    closeDropdown();
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick);
});

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

.navbar-nav.ms-auto {
  margin-left: auto !important;
  align-items: center;
}

.nav-item.dropdown {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
}

.navbar-nav.ms-auto .dropdown-menu {
  margin-top: 0;
  left: auto;
  right: -0.85rem;
  min-width: 0;
  width: calc(100% + 1.7rem);
  border-radius: 0.75rem;
  padding: 0.25rem 0;
  overflow: hidden;
  top: calc(100% + 0.5rem);
  transform: none !important;
}

.navbar-nav.ms-auto .dropdown-menu .dropdown-item,
.navbar-nav.ms-auto .dropdown-menu .dropdown-divider {
  padding-left: 1rem;
  padding-right: 1rem;
}

.navbar-nav.ms-auto .dropdown-menu .logout-item {
  color: #b23b3b;
  font-weight: 600;
}

.navbar-nav.ms-auto .dropdown-menu .logout-item :deep(svg) {
  color: inherit;
}

.navbar-nav.ms-auto .dropdown-menu .logout-item:hover,
.navbar-nav.ms-auto .dropdown-menu .logout-item:focus {
  color: #b23b3b;
  background-color: rgba(178, 59, 59, 0.08);
}

.user-dropdown-toggle {
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--primary-1), var(--primary-2));
  color: #ffffff !important;
  border: none;
  box-shadow: 0 10px 20px rgba(96, 165, 250, 0.25);
  width: auto;
  margin: 0;
  margin-left: 0;
}

.user-dropdown-toggle:hover,
.user-dropdown-toggle:focus {
  color: #ffffff !important;
  text-decoration: none;
  box-shadow: 0 12px 26px rgba(96, 165, 250, 0.35);
}

.user-meta {
  max-width: 12rem;
  justify-content: flex-end;
  text-align: right;
}

.user-name {
  max-width: 7.5rem;
}

.user-points {
  font-size: 0.8rem;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0.02em;
}

.user-points-icon {
  color: #ffd54f;
}

.user-points-value,
.user-points-label {
  line-height: 1;
}

@media (max-width: 575.98px) {
  .user-meta {
    max-width: none;
  }

  .user-name {
    max-width: 6.5rem;
  }
}
</style>

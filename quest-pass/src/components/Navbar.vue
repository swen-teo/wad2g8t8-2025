<nav class="navbar navbar-expand-lg navbar-light sticky-top">
    <div class="container">
        <a class="navbar-brand fw-bold" href="./">
            <i class="fas fa-ticket-alt me-2"></i>QuestPass
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <!-- logged in links -->
            <ul class="navbar-nav me-auto" v-if="currentUser">
                <li class="nav-item">
                    <a class="nav-link" href="./">
                        <i class="fas fa-calendar-alt me-2"></i>Events
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="profile-page.html">
                        <i class="fas fa-user-circle me-2"></i>Profile
                    </a>
                </li>
            </ul>
            <!-- spacer for logged out -->
            <div class="me-auto" v-else></div>

            <!-- user dropdown (logged in) -->
            <div class="navbar-nav" v-if="currentUser">
                <div class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" @click.stop.prevent="toggleDropdown($event)">
                        <img :src="currentUser.avatar" alt="Avatar" class="rounded-circle me-2" width="32" height="32">
                        <span>{{ currentUser.name }}</span>
                        <span v-if="currentTier" class="badge ms-2" :style="{backgroundColor: currentTier.color}">{{ currentUser.currentTier }}</span>
                    </a>
                    <ul v-if="isDropdownOpen" class="dropdown-menu dropdown-menu-end show" :style="dropdownStyle">
                        <li>
                            <a class="dropdown-item" href="login-page.html">
                                <i class="fas fa-sign-out-alt fa-fw me-2"></i>Logout
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- login/signin page -->
            <div class="navbar-nav" v-else>
                <a href="login-page.html" class="btn btn-outline-light me-2">Login</a>
                <a href="login-page.html" class="btn btn-primary">Sign Up</a>
            </div>
        </div>
    </div>
</nav>
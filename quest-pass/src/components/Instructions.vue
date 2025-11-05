<template>

    <!-- <div id="scroll-indicator">
        <font-awesome-icon icon="fa-solid fa-angle-down" aria-hidden="true" />
    </div> -->

    <div class="container d-block text-center mt-5 mb-5 hero-section">
        <div class="qp-logo-badge">
            <font-awesome-icon icon="fa-solid fa-music" aria-hidden="true" />
        </div>
        <h1 class="display-4 mt-4 qp-title">
            QUESTPASS
        </h1>
        <div class="h5 mt-4 qp-subtitle">
            Complete quests. Earn points. Unlock exclusive presale access <br>to your favorite concerts.
        </div>
    </div>

    <div class="container mt-5 mb-5 fade-in-sequential-cards" >
        <div class="qp-features">
            
            <div class="card w-100">
                <div class="card-body">
                    <div class="qp-card-icon">
                        <font-awesome-icon icon="fa-solid fa-music" aria-hidden="true" />
                    </div>
                    <h4 class="card-title mb-3 fw-bold">Complete Quests</h4>
                    <p class="card-text text-muted">Listen to songs, follow artists, and take quizzes to earn points for your favorite events.</p>
                </div>
            </div>
            
            <div class="card w-100">
                <div class="card-body">
                    <div class="qp-card-icon">
                        <font-awesome-icon icon="fa-solid fa-trophy" aria-hidden="true" />
                    </div>
                    <h4 class="card-title mb-3 fw-bold">Earn Points</h4>
                    <p class="card-text text-muted">Accumulate points to unlock eligibility for exclusive presale opportunities.</p>
                </div>
            </div>
            
            <div class="card w-100">
                <div class="card-body">
                    <div class="qp-card-icon">
                        <font-awesome-icon icon="fa-solid fa-ticket" aria-hidden="true" />
                    </div>
                    <h4 class="card-title mb-3 fw-bold">Get Presale Access</h4>
                    <p class="card-text text-muted">Unlock presale codes and links to purchase tickets on Ticketmaster before the general public.</p>
                </div>
            </div>

        </div>
    </div>

    
    <div class="container my-5 py-5 fade-in-section">
        <h1 class="text-center mb-5 fw-bold">How It Works</h1>
        <div class="mx-auto" style="max-width: 700px;">

            <div class="mb-4 step-hover-reveal">
                <button class="btn btn-secondary w-100 text-start p-3 fs-4" type="button">
                    <span class="badge me-3 fs-4">1</span>
                    Connect Your Spotify Account
                </button>
                <div class="collapse">
                    <div class="card card-body mt-2" style="background-color: #fdfdfd; border-color: #eee;">
                        <p class="mb-0 text-secondary fs-5 text-center">
                            Sign in securely with Spotify to link your listening activity and unlock quest tracking.
                        </p>
                    </div>
                </div>
            </div>

            <div class="mb-4 step-hover-reveal">
                <button class="btn btn-secondary w-100 text-start p-3 fs-4" type="button">
                    <span class="badge me-3 fs-4">2</span>
                    Browse Events &amp; Quests
                </button>
                <div class="collapse">
                    <div class="card card-body mt-2" style="background-color: #fdfdfd; border-color: #eee;">
                        <p class="mb-0 text-secondary fs-5 text-center">
                            Discover upcoming concerts and see what quests you need to complete for presale access.
                        </p>
                    </div>
                </div>
            </div>

            <div class="mb-4 step-hover-reveal">
                <button class="btn btn-secondary w-100 text-start p-3 fs-4" type="button">
                    <span class="badge me-3 fs-4">3</span>
                    Complete Interactive Quests
                </button>
                <div class="collapse">
                    <div class="card card-body mt-2" style="background-color: #fdfdfd; border-color: #eee;">
                        <p class="mb-0 text-secondary fs-5 text-center">
                            Stream songs and answer trivia questions. We verify your progress automatically.
                        </p>
                    </div>
                </div>
            </div>

            <div class="mb-4 step-hover-reveal">
                <button class="btn btn-secondary w-100 text-start p-3 fs-4" type="button">
                    <span class="badge me-3 fs-4">4</span>
                    Unlock Presale Codes
                </button>
                <div class="collapse">
                    <div class="card card-body mt-2" style="background-color: #fdfdfd; border-color: #eee;">
                        <p class="mb-0 text-secondary fs-5 text-center">
                            Once you earn enough points, your presale code becomes visible. Use it on Ticketmaster to get early access!
                        </p>
                    </div>
                </div>
            </div>

        </div>
    </div>

    <div class="container my-5 py-4 text-center">
        <p class="fs-5 text-secondary mb-4">
            Ready to start completing quests? Head into the app to see your personalized dashboard.
        </p>
        <button
            class="btn btn-primary btn-lg px-5"
            type="button"
            @click="enterApp"
            :disabled="isCompleting"
        >
            <span
                v-if="isCompleting"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
            ></span>
            Enter QuestPass
        </button>
    </div>
</template>

<script setup>
// In a real .vue file, you'd import Vue features like this
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user.js';

const router = useRouter();
const userStore = useUserStore();
const isCompleting = ref(false);

async function enterApp() {
    if (isCompleting.value) return;

    isCompleting.value = true;

    try {
        // Guests proceed to Login after onboarding
        await router.push({ name: 'Login' });
    } finally {
        isCompleting.value = false;
    }
}

// The logic from setup() goes directly inside <script setup>
onMounted(() => {
    // This page is guest-only via router guard; no redirect needed here for logged-in users.

    
    // --- Scroll Indicator ---
    // This targets the #scroll-indicator in the main HTML file
    // THIS CODE IS NOW ACTIVE BECAUSE THE ELEMENT EXISTS
    const scrollIndicator = document.getElementById('scroll-indicator');
    if (scrollIndicator) {
        const handleScrollIndicator = () => {
            if (window.scrollY > 30) {
                scrollIndicator.classList.add('hidden');
            } else {
                scrollIndicator.classList.remove('hidden');
            }
        };
        window.addEventListener('scroll', handleScrollIndicator);
        handleScrollIndicator();
    }

    // --- Intersection Observer for Scroll Animations ---
    // This targets elements rendered by this component's template
    // THIS CODE IS WHAT MAKES YOUR CARDS FADE IN ON SCROLL
    const sectionsToAnimate = document.querySelectorAll('.fade-in-section, .fade-in-sequential-cards');
    if (sectionsToAnimate.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -150px 0px',
            threshold: 0.4 // <- Triggers when 40% of the section is visible
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible'); // <- This class triggers the animation
                    observer.unobserve(entry.target);
                }
            });
        };

        const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);
        sectionsToAnimate.forEach(section => {
            intersectionObserver.observe(section);
        });
    }

    // This observer logic would also need to be run for the footer
    // In a real SFC app, the footer would likely be in a different component.
    const footer = document.querySelector('footer.fade-in-section');
    if (footer) {
        const footerObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                entries[0].target.classList.add('is-visible');
                footerObserver.unobserve(entries[0].target);
            }
        }, { threshold: 0.4 });
        footerObserver.observe(footer);
    }
});
</script>

<style>
/* NOTE: This is NOT 'scoped'.
  These are global styles that affect the <body>, <html>, and IDs
  outside of the component (like #loader, #sparkle-container).
*/

/* =========================================================
QuestPass — Soft Pastel Theme (Full CSS)
Font: Poppins (site-wide)
========================================================= */

/* 1) Fonts */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

/* 2) Design Tokens */
:root {
--ink: #2d2d3d;
--ink-muted: #707089;

--bg-1: #fff0ff;
--bg-2: #efeaff;
--bg-3: #f3e9ff;

--chip-1: #f1e7ff;
--chip-2: #fde7f7;
--icon-tone: #8a7df9;

--primary-1: #a78bfa; /* purple */
--primary-2: #60a5fa; /* blue */

--card: #ffffff;
--card-radius: 22px;
--elev-1: 0 12px 28px rgba(125,120,255,.10), 0 2px 6px rgba(90,70,180,.05);
--elev-1h: 0 16px 34px rgba(125,120,255,.14), 0 3px 8px rgba(90,70,180,.06);

--ring: #d8c7ff;
}

/* 3) Base */
html { box-sizing: border-box; }
*, *::before, *::after { box-sizing: inherit; }

body {
font-family: 'Poppins', sans-serif;
font-weight: 400;
color: var(--ink);
min-height: 100vh;
margin: 0;
background:
    radial-gradient(1200px 600px at 50% -10%, var(--bg-1) 0%, transparent 50%),
    radial-gradient(1000px 500px at 90% 10%, var(--bg-2) 0%, transparent 55%),
    linear-gradient(180deg, var(--bg-3) 0%, #f7f3ff 60%, #f9f6ff 100%);
overflow-x: hidden; /* Prevent horizontal scroll */
}

h1, h2, h3, h4, h5, h6 {
font-family: 'Poppins', sans-serif;
font-weight: 600;
margin: 0 0 .5rem 0;
color: var(--ink);
}
.display-4 { font-size: 3rem; line-height: 1.1; }

.main-content { padding-top: 2rem; }
.hero-section { padding: 3rem 0; }

/* 4) Navbar */
.navbar {
background: #fff !important;
border-bottom: 1px solid #eee;
box-shadow: var(--elev-1);
padding: 1rem 1.5rem;
}

.navbar-brand {
font-family: 'Poppins', sans-serif;
font-weight: 700;
font-size: 1.35rem;
color: var(--ink) !important;
}

/* 5) Cards */
.card {
background: var(--card);
color: var(--ink);
border: none;
border-radius: var(--card-radius);
box-shadow: var(--elev-1);
overflow: hidden;
transition: transform .15s ease, box-shadow .15s ease;
display: flex;
flex-direction: column;
min-height: 300px; /* Adjusted min-height */
}

.card:hover { 
    transform: translateY(-4px) scale(1.05); 
    /* Changed opacity from .25 to .4 and from .1 to .2 */
    box-shadow: 0 20px 45px rgba(90, 90, 200, .4), 0 5px 12px rgba(60, 50, 150, .2) !important;
    z-index: 10;
}

.card-body, .card__body {
padding: 1.5rem;
flex: 1 1 auto;
display: flex;
flex-direction: column;
}

/* Custom class for card icons */
.qp-card-icon {
    width: 50px; height: 50px; margin-bottom: 1.5rem; border-radius: 999px;
    background: linear-gradient(135deg, var(--chip-1) 0%, var(--chip-2) 100%);
    display: grid; place-items: center;
    box-shadow: 0 6px 14px rgba(130,120,255,.12);
}
.qp-card-icon i { font-size: 1.25rem; color: var(--icon-tone); opacity: .9; }


/* 6) Buttons */
.btn {
font-family: 'Poppins', sans-serif;
font-weight: 500;
font-size: 1rem;
padding: .8rem 1.2rem;
border-radius: 999px;
border: 0;
letter-spacing: .2px;
transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
color: #fff;
background: linear-gradient(90deg, var(--primary-1) 0%, var(--primary-2) 100%);
box-shadow: 0 8px 20px rgba(96,165,250,.20);
}
.btn:hover { transform: translateY(-2px); box-shadow: 0 12px 26px rgba(96,165,250,.35); color: #fff; }
.btn:active { transform: translateY(0); box-shadow: 0 6px 14px rgba(96,165,250,.25) !important; }

/* Ghost secondary */
.btn-secondary {
background: #ffffffcc;
color: #7a6fb6;
border: 1px solid #e8d9ff;
box-shadow: none;
backdrop-filter: blur(6px);
}

.btn-secondary:hover {
border-color: var(--ring);
/* This is the new, darker shadow you wanted */
box-shadow: 0 20px 45px rgba(90, 90, 200, .4), 0 5px 12px rgba(60, 50, 150, .2);
background: #fff;
color: #7a6fb6;
}

/* 8) Badges */
.badge {
padding: .5em .75em;
border-radius: 999px;
border: 1px solid #eee;
background: linear-gradient(135deg, var(--chip-1) 0%, var(--chip-2) 100%);
color: var(--ink);
font-size: .95rem;
font-weight: 500;
box-shadow: 0 6px 14px rgba(130,120,255,.12);
}

/* 14) Hero helpers (screenshot look) */
.qp-title {
background: linear-gradient(180deg, #b8d4ff 0%, #a5b9ff 45%, #c4a7ff 100%);
-webkit-background-clip: text; background-clip: text;
-webkit-text-fill-color: transparent;
font-weight: 700;
letter-spacing: .2px;
}
.qp-subtitle { color: var(--ink-muted); }
.qp-logo-badge {
width: 84px; height: 84px; margin: 0 auto 1.25rem; border-radius: 999px;
background:
    radial-gradient(90px 90px at 30% 20%, #ffffff99 0%, transparent 40%),
    linear-gradient(135deg, var(--chip-1) 0%, var(--chip-2) 100%);
display: grid; place-items: center;
box-shadow: 0 8px 24px rgba(130,120,255,.18);
}
.qp-logo-badge i { font-size: 34px; color: var(--icon-tone); opacity: .9; }

/* 15) Feature cards grid */
.qp-features {
display: grid;
gap: 1.25rem;
grid-template-columns: repeat(1, minmax(0, 1fr));
}
@media (min-width: 768px) {
.qp-features { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}


/* HOW IT WORKS LOGIN PG */
.step-hover-reveal .collapse {
    /* This makes the "collapse" div visible to CSS */
    display: block;

    /* Use max-height and overflow to create the transition */
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.35s ease-out;
}

.step-hover-reveal:hover .collapse {
    /* Set a height large enough to show the content */
    max-height: 150px; /* <-- INCREASED THIS VALUE */
    transition: max-height 0.35s ease-in;
}


/* --- Scroll Animations --- */
.fade-in-section {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.fade-in-section.is-visible {
    opacity: 1;
    transform: translateY(0);
}

/* --- Sequential Card Pop-in --- */
.fade-in-sequential-cards {
    /* This parent container just acts as a trigger */
    /* It fades in slightly to not be jarring */
    opacity: 0;
    transition: opacity 0.3s ease-out;
}
.fade-in-sequential-cards.is-visible {
    opacity: 1; /* Once visible, its children can animate */
}

.fade-in-sequential-cards .qp-features .card {
    opacity: 0; /* Start invisible */
    transform: scale(0.3) translateY(100px); /* Start small and down */
    animation-fill-mode: forwards;
}

/* When the parent is visible, trigger the animation on the cards */
.fade-in-sequential-cards.is-visible .qp-features .card {
    /* A 'boing' easing function */
    animation: pop-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

/* Define the keyframe */
@keyframes pop-in {
    0% {
        opacity: 0;
        transform: scale(0.3) translateY(100px);
    }
    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

/* Add the sequential delays */
.fade-in-sequential-cards.is-visible .qp-features .card:nth-child(1) {
    animation-delay: 0.1s;
}
.fade-in-sequential-cards.is-visible .qp-features .card:nth-child(2) {
    animation-delay: 0.3s;
}
.fade-in-sequential-cards.is-visible .qp-features .card:nth-child(3) {
    animation-delay: 0.5s;
}

/* --- Scroll Down Indicator --- */
/* THIS CSS WAS ALREADY HERE AND IS NOW BEING USED */
/* --- Scroll Down Indicator --- */
#scroll-indicator i {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    color: var(--primary-1);
    font-size: 2.5rem; /* <-- Now this will work */
    opacity: 0.7;
    transition: opacity 0.4s ease, visibility 0.4s ease;
    animation: bounce-down 2s infinite ease-in-out;
}

#scroll-indicator.hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
}

@keyframes bounce-down {
    0%, 20%, 50%, 80%, 100% {
        transform: translateX(-50%) translateY(0);
    }
    40% {
        transform: translateX(-50%) translateY(10px);
    }
    60% {
        transform: translateX(-50%) translateY(5px);
    }
}
</style>
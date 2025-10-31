<template>
  <div
    id="loader"
    class="loader-overlay"
    :class="{ hidden: !isLoading }"
  >
    <div class="loader-content">
      <h1
        id="final-word"
        class="loading-text subtle-float"
        :class="{ reveal: isWordRevealed }"
        aria-label="QUESTPASS"
      >
        <span style="--i: 1">Q</span>
        <span style="--i: 2">U</span>
        <span style="--i: 3">E</span>
        <span style="--i: 4">S</span>
        <span style="--i: 5">T</span>
        <span style="--i: 6">P</span>
        <span style="--i: 7">A</span>
        <span style="--i: 8">S</span>
        <span style="--i: 9">S</span>
      </h1>

      <div
        id="hero-image-container"
        class="subtle-float"
        :style="heroStyle"
      >
        <img
          src="https://images.unsplash.com/photo-1566477712363-3c75dd39b416?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrcG9wJTIwY29uY2VydCUyMHN0YWdlfGVufDF8fHx8MTc2MDk0MTQyM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Concert stage with vibrant lights"
          class="hero-image"
          onerror="this.onerror=null;this.src='https://placehold.co/800x900/f3e9ff/2d2d3d?text=QuestPass';"
        />

        <div class="floating-card card-1">
          <div class="floating-card-icon icon-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 3c.3 0 .5.2.5.5v3c0 .3-.2.5-.5.5s-.5-.2-.5-.5v-3c0-.3.2-.5.5-.5z" />
              <path d="M6.4 6.4c.2-.2.5-.2.7 0l2.1 2.1c.2.2.2.5 0 .7s-.5.2-.7 0L6.4 7.1c-.2-.2-.2-.5 0-.7z" />
              <path d="M3 12c0-.3.2-.5.5-.5h3c.3 0 .5.2.5.5s-.2.5-.5.5h-3c-.3 0-.5-.2-.5-.5z" />
              <path d="M6.4 17.6c-.2.2-.5.2-.7 0l-2.1-2.1c-.2-.2-.2-.5 0-.7s.5-.2.7 0l2.1 2.1c.2.2.2.5 0 .7z" />
              <path d="M12 21c-.3 0-.5-.2-.5-.5v-3c0 .3.2.5.5.5s.5.2.5.5v3c0 .3-.2.5-.5.5z" />
              <path d="M17.6 17.6c.2-.2.5-.2.7 0l2.1-2.1c.2.2.2.5 0 .7s-.5.2-.7 0l-2.1 2.1c-.2.2-.2.5 0 .7z" />
              <path d="M21 12c0 .3-.2.5-.5.5h-3c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h3c.3 0 .5.2.5.5z" />
              <path d="M17.6 6.4c.2.2.5.2.7 0l2.1 2.1c.2.2.2.5 0 .7s-.5.2-.7 0l-2.1-2.1c-.2-.2-.2-.5 0-.7z" />
            </svg>
          </div>
          <div>
            <div class="floating-card-label">Quests Done</div>
            <div class="floating-card-value">12/15</div>
          </div>
        </div>
        <div class="floating-card card-2">
          <div class="floating-card-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.45 1-1 1H5c-.55 0-1-.45-1-1v-2.34" />
              <path d="M14 9V6.5c0-.83-.67-1.5-1.5-1.5h-1c-.83 0-1.5.67-1.5 1.5V9" />
              <path d="M15 22v-4.33c0-.55.45-1 1-1h4c.55 0 1 .45 1 1V22" />
            </svg>
          </div>
          <div>
            <div class="floating-card-label">Your Points</div>
            <div class="floating-card-value">2,450 pts</div>
          </div>
        </div>
      </div>

      <a
        id="enter-button"
        class="btn"
        href="#"
        @click.prevent="enterSite"
        :style="buttonStyle"
      >
        Enter
      </a>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const isLoading = ref(true);
const isWordRevealed = ref(false);
const heroStyle = ref({
  opacity: 0,
  transform: 'scale(1.08) translateY(8px)',
});
const buttonStyle = ref({
  opacity: 0,
});

const word = 'QUESTPASS';
const letters = word.split('');

onMounted(() => {
  isWordRevealed.value = true;

  const perLetterDelay = 0.03;          // was 0.06
const letterAnimDuration = 0.35;      // was 0.6
const totalStagger = Math.min(0.6, letters.length * perLetterDelay + letterAnimDuration); // cap at 0.6s
const heroRevealDelay = totalStagger * 1000 + 40; // was +80

  setTimeout(() => {
    heroStyle.value = {
      opacity: 1,
      transform: 'scale(1) translateY(0)',
      transition: 'opacity 360ms ease, transform 360ms ease',
    };
  }, heroRevealDelay);

  const buttonRevealDelay = heroRevealDelay + 180;
  setTimeout(() => {
    buttonStyle.value = {
      opacity: 1,
      animation: 'reveal-button 480ms ease forwards',
    };
  }, buttonRevealDelay);
});

const router = useRouter();

function enterSite() {
  isLoading.value = false;

  setTimeout(() => {
    router.push({ name: 'Login' });
  }, 600);
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

:global(:root) {
  --ink: #2d2d3d;
  --ink-muted: #707089;
  --bg-1: #fff0ff;
  --bg-2: #efeaff;
  --bg-3: #f3e9ff;
  --chip-1: #f1e7ff;
  --chip-2: #fde7f7;
  --icon-tone: #8a7df9;
  --primary-1: #a78bfa;
  --primary-2: #60a5fa;
  --card: #ffffff;
  --card-radius: 22px;
  --elev-1: 0 12px 28px rgba(125, 120, 255, 0.1), 0 2px 6px rgba(90, 70, 180, 0.05);
  --elev-1h: 0 16px 34px rgba(125, 120, 255, 0.14), 0 3px 8px rgba(90, 70, 180, 0.06);
  --ring: #d8c7ff;
}

:global(html) {
  box-sizing: border-box;
}

:global(*,
*::before,
*::after) {
  box-sizing: inherit;
}

:global(body) {
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
  color: var(--ink);
  min-height: 100vh;
  margin: 0;
  background:
    radial-gradient(1200px 600px at 50% -10%, var(--bg-1) 0%, transparent 50%),
    radial-gradient(1000px 500px at 90% 10%, var(--bg-2) 0%, transparent 55%),
    linear-gradient(180deg, var(--bg-3) 0%, #f7f3ff 60%, #f9f6ff 100%);
}

.loader-overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #ffffff, #f7f3ff);
  z-index: 9999;
  transition: opacity 0.6s ease-in-out, visibility 0.6s ease-in-out;
  overflow: hidden;
}

.loader-overlay.hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  width: 100%;
  height: 100%;
}

.loading-text {
  position: relative;
  z-index: 2;
  font-family: 'Poppins', sans-serif;
  font-size: clamp(3rem, 15vw, 8rem);
  font-weight: 700;
  color: transparent;
  background: linear-gradient(90deg, var(--primary-1) 0%, var(--primary-2) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  letter-spacing: -0.05em;
  margin: 0;
  padding-bottom: 2rem;
  transform: translateZ(0);
}

.loading-text span {
  display: inline-block;
  opacity: 0;
  transform: translateY(30px) scale(0.9);
  background: linear-gradient(90deg, var(--primary-1) 0%, var(--primary-2) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.loading-text.reveal span {
  animation: reveal-letter 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: calc(var(--i) * 0.06s);
}

@keyframes reveal-letter {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.btn {
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  font-size: 1rem;
  padding: 0.8rem 1.5rem;
  border-radius: 999px;
  border: 0;
  letter-spacing: 0.2px;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  color: #fff;
  background: linear-gradient(90deg, var(--primary-1) 0%, var(--primary-2) 100%);
  box-shadow: 0 8px 20px rgba(96, 165, 250, 0.2);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 26px rgba(96, 165, 250, 0.35);
}

.btn:active {
  transform: translateY(0);
  box-shadow: 0 6px 14px rgba(96, 165, 250, 0.25) !important;
}

#enter-button {
  margin-top: 1.5rem;
}

@keyframes reveal-button {
  to {
    opacity: 1;
  }
}

#hero-image-container {
  margin-top: 2rem;
  position: relative;
  display: grid;
  place-items: center;
  max-width: 400px;
}

@keyframes subtle-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.subtle-float {
  animation: subtle-float 4s ease-in-out infinite;
}

.hero-image {
  border-radius: var(--card-radius);
  box-shadow: var(--elev-1h);
  width: 100%;
}

.floating-card {
  position: absolute;
  background: var(--card);
  padding: 1rem;
  border-radius: 1.25rem;
  box-shadow: var(--elev-1);
  border: 1px solid #f0e6ff;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 200px;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-duration: 4s;
}

.floating-card.card-1 {
  top: -2rem;
  right: -2rem;
  animation-name: card-float-1;
}

.floating-card.card-2 {
  bottom: -0.01rem;
  left: -1.2rem;
  animation-name: card-float-2;
  animation-delay: 1s;
}

.floating-card-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: #fff;
  background: linear-gradient(135deg, var(--primary-1), var(--primary-2));
}

.floating-card-icon.icon-2 {
  background: linear-gradient(135deg, var(--chip-1), var(--chip-2));
  color: var(--icon-tone);
}

.floating-card-label {
  color: var(--ink-muted);
  font-size: 0.8rem;
  font-weight: 500;
}

.floating-card-value {
  font-size: 1.25rem;
  font-weight: 600;
}

@keyframes card-float-1 {
  0%,
  100% {
    transform: translateY(0) rotate(0);
  }
  50% {
    transform: translateY(-15px) rotate(5deg);
  }
}

@keyframes card-float-2 {
  0%,
  100% {
    transform: translateY(0) rotate(0);
  }
  50% {
    transform: translateY(-10px) rotate(-5deg);
  }
}

.floating-card {
  display: none;
}

@media (min-width: 640px) {
  .floating-card {
    display: flex;
  }
}
</style>

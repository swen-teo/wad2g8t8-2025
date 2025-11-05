<template>
  <div :class="['loader-overlay', { hidden: !isLoading }]">
    <div class="loader-content">
      <div class="turntable" aria-hidden="true">
        <div class="platter-shadow"></div>

        <div class="vinyl" :class="{ spinning: isLoading }">
          <div class="cover-stack">
            <img
              v-for="(cover, index) in covers"
              :key="cover"
              :src="cover"
              :alt="`Loading artwork ${index + 1}`"
              class="cover"
              :style="{ '--cover-index': index }"
              loading="lazy"
            >
          </div>
          <div class="grooves"></div>
          <div class="cover-gloss"></div>
          <div class="spindle"></div>
        </div>

        <div class="tonearm" :class="{ playing: isLoading }">
          <div class="head"></div>
        </div>
      </div>

      <div class="loader-caption" role="status" aria-live="polite">
        <span class="caption-title">{{ title }}</span>
        <span class="caption-subtitle">{{ subtitle }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const { isLoading, title, subtitle } = defineProps({
  isLoading: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: 'Spinning up events…',
  },
  subtitle: {
    type: String,
    default: 'Cueing the next experience',
  },
});

const covers = [
  'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200_webp/d4f896125442961.6119ab33451ce.png',
  'https://cdn3.f-cdn.com//files/download/198354575/Ekran%20g%C3%B6r%C3%BCnt%C3%BCs%C3%BC%202023-05-27%20202204.png?width=780&height=1089&fit=crop',
  'https://i.ebayimg.com/images/g/xMIAAOSwiHlgmGH8/s-l1200.jpg',
  'https://ew.com/thmb/2QtrKxN4hhEB5sMSD4-mPPoAAKc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/JB_Key_Art_1500x2000-f0bb47f694a1436182c83488c68ec29a.jpg',
  'https://png.pngtree.com/png-clipart/20210627/original/pngtree-purple-light-effect-violin-concert-poster-png-image_6457012.jpg',
  'https://i.redd.it/uefm2er845da1.jpg',
];
</script>

<style scoped>
.loader-overlay {
  position: fixed;
  inset: 0;
  /* Ensure external classes (like Bootstrap margin utilities) don't clip the overlay */
  margin: 0 !important;
  width: 100vw;
  height: 100dvh;
  display: grid;
  place-items: center;
  background:
    radial-gradient(1200px 600px at 50% -10%, var(--bg-1) 0%, transparent 50%),
    radial-gradient(1000px 500px at 90% 10%, var(--bg-2) 0%, transparent 55%),
    linear-gradient(180deg, var(--bg-3) 0%, #f7f3ff 60%, #f9f6ff 100%);
  z-index: 9999;
  transition: opacity 0.6s ease, visibility 0.6s ease;
  opacity: 1;
  visibility: visible;
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
  gap: 2.5rem;
  color: var(--ink);
  text-align: center;
}

.turntable {
  position: relative;
  width: clamp(220px, 60vw, 320px);
  aspect-ratio: 1;
  border-radius: 16px;
  background: linear-gradient(135deg, #1f2534 0%, #121723 100%);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.45);
  padding: clamp(1.5rem, 5vw, 2.25rem);
  overflow: hidden;
}

.platter-shadow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 40% 35%, rgba(255, 255, 255, 0.08), transparent 55%),
    radial-gradient(circle at 70% 75%, rgba(255, 255, 255, 0.04), transparent 50%);
  pointer-events: none;
}

.vinyl {
  position: absolute;
  inset: 10%;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 45%, #262b3a 0%, #0d111a 65%, #090d14 100%);
  box-shadow: inset 0 0 24px rgba(0, 0, 0, 0.55), 0 18px 30px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.vinyl.spinning {
  animation: spin 7.5s linear infinite;
}

.cover-stack {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  overflow: hidden;
}

.cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  animation: coverCycle 12s linear infinite;
  animation-delay: calc(var(--cover-index) * 2s);
}

.grooves {
  position: absolute;
  inset: 8%;
  border-radius: 50%;
  background-image: repeating-radial-gradient(
    circle,
    rgba(255, 255, 255, 0.06) 0px,
    rgba(255, 255, 255, 0.06) 2px,
    rgba(255, 255, 255, 0) 3px,
    rgba(255, 255, 255, 0) 5px
  );
  mix-blend-mode: screen;
  opacity: 0.65;
  pointer-events: none;
}

.cover-gloss {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.25), transparent 60%);
  pointer-events: none;
}

.spindle {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.85) 0%, rgba(15, 23, 42, 0.45) 60%, transparent 100%);
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.45);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.tonearm {
  position: absolute;
  right: -24px;
  top: 18px;
  width: 160px;
  height: 12px;
  background: linear-gradient(#c9ced8, #aeb6c7);
  border-radius: 6px;
  transform-origin: left center;
  transform: rotate(22deg);
  transition: transform 0.6s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.tonearm.playing {
  transform: rotate(12deg);
}

.tonearm .head {
  position: absolute;
  right: 0;
  top: -6px;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  background: #1f2937;
  box-shadow: inset 0 0 4px rgba(255, 255, 255, 0.12), 0 4px 10px rgba(0, 0, 0, 0.35);
}

.loader-caption {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-family: 'Poppins', sans-serif;
}

.caption-title {
  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: 600;
  letter-spacing: 0.03em;
}

.caption-subtitle {
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-weight: 400;
  color: var(--ink-muted);
}

@keyframes spin {
  to {
    transform: rotate(1turn);
  }
}

@keyframes coverCycle {
  0%, 20% {
    opacity: 1;
  }
  28%, 100% {
    opacity: 0;
  }
}

@media (max-width: 480px) {
  .loader-content {
    gap: 2rem;
  }

  .turntable {
    border-radius: 24px;
  }
}
</style>

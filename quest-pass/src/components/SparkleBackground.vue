<template>
  <div id="sparkle-container" ref="sparkleContainer"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';

const sparkleContainer = ref(null);
const SPARKLE_COUNT = 25;
const STAR_SVG = '<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
const COLOR_PRIMARY = '#a78bfa';
const COLOR_SECONDARY = '#c8b6ff';

function populateSparkles() {
  const container = sparkleContainer.value;
  if (!container) return;

  container.innerHTML = '';

  for (let i = 0; i < SPARKLE_COUNT; i += 1) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    sparkle.innerHTML = STAR_SVG;

    const randomDuration = 8 + Math.random() * 7;
    const randomStartOffset = Math.random() * randomDuration;

    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${-Math.random()}%`;
    sparkle.style.animationDuration = `${randomDuration}s`;
    sparkle.style.animationDelay = `${-randomStartOffset}s`;
    sparkle.style.color = Math.random() > 0.5 ? COLOR_PRIMARY : COLOR_SECONDARY;

    container.appendChild(sparkle);
  }
}

onMounted(() => {
  populateSparkles();
});

onBeforeUnmount(() => {
  if (sparkleContainer.value) {
    sparkleContainer.value.innerHTML = '';
  }
});
</script>

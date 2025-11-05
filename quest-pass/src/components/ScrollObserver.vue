<template>
  <div 
    :class="['scroll-observer-wrapper', { 'animate-reveal': isVisible }, animationClass]"
    :style="{ 'transition-delay': delay }"
    ref="root"  >
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const props = defineProps({
  delay: {
    type: String,
    default: '0s',
  },
  direction: {
    type: String,
    default: 'right', 
    validator: (value) => ['left', 'right'].includes(value),
  },
});

const isVisible = ref(false);

const root = ref(null); 

const animationClass = computed(() => `slide-in-from-${props.direction}`);

onMounted(() => {
  const targetElement = root.value; 

  if (!targetElement) {
    console.error("ScrollObserver: Root element failed to bind.");
    return;
  }

  const options = {
    root: null,
    threshold: 0, 
    rootMargin: '0px 0px -100px 0px', 
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          isVisible.value = true;
        }, parseFloat(props.delay));
      } else {
        isVisible.value = false;
      }
    });
  }, options);

  // Observe the component's own root element
  observer.observe(targetElement); 
});
</script>

<style scoped>
/* Base Styles: Hides and Shifts Element */
.scroll-observer-wrapper {
  opacity: 0;
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

/* Animations for sliding in (initial, hidden state) */
.slide-in-from-right {
  transform: translateX(50px);
}

.slide-in-from-left {
  transform: translateX(-50px);
}

/* Reveal State: Visible and in position */
/* Final state when visible—this overrides the initial transform and opacity */
.animate-reveal {
  opacity: 1 !important;
  transform: translateX(0) !important;
}
</style>
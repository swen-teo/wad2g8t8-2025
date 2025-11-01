<template>
  <button 
    class="start-quest-button btn" 
    @mouseenter="triggerNotes"
    @click="$emit('start-quest')" 
    :disabled="props.isDisabled" 
  >
    <i :class="props.iconClass" v-if="props.iconClass"></i> 
    
    {{ props.buttonText }}
    
    <span class="music-particles">
      <span 
        v-for="note in notes" 
        :key="note.id" 
        :class="['note']" 
        :data-symbol="note.symbol" 
        :style="note.style"
      ></span>
    </span>
  </button>
</template>

<script setup>
import { ref, nextTick, defineProps, defineEmits } from 'vue';

// --- PROPS (Configuration for the button) ---
const props = defineProps({
  isDisabled: {
    type: Boolean,
    default: false
  },
  buttonText: {
    type: String,
    default: 'Start Quest'
  },
  iconClass: {
    type: String,
    default: ''
  }
});

// --- EMITS ---
defineEmits(['start-quest']);


// --- ANIMATION LOGIC (Composition API) ---
const noteTemplates = [
  { symbol: '🎶', translateX: -10, size: 16, delay: '0.05s' },
  { symbol: '♪', translateX: 15, size: 20, delay: '0s' },
  { symbol: '♬', translateX: 0, size: 14, delay: '0.1s' }
];

const notes = ref([]);
let noteIdCounter = 0;

function triggerNotes() {
  // Clear the array to reset animation
  notes.value = [];
  
  // Wait for Vue to clear the DOM, then add new notes to restart animation
  nextTick(() => {
    noteTemplates.forEach((template) => {
      const newNote = {
        id: noteIdCounter++,
        symbol: template.symbol,
        style: {
          '--translate-x': `${template.translateX}px`,
          'font-size': `${template.size}px`,
          // Force animation restart
          'animation': `float-and-fade 2.0s ease-out forwards`,
          'animation-delay': template.delay 
        }
      };
      notes.value.push(newNote);
    });
  });
}
</script>

<style scoped>
/* NOTE: The CSS remains correct and handles the aesthetic and animation */
.start-quest-button {
    position: relative; 
    overflow: visible;
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    font-size: 16px;
    background: linear-gradient(135deg, #a86cff, #6f86ff); 
    color: white;
    border-radius: 8px;
    transition: transform 0.1s, box-shadow 0.2s; 
    /* Add 'btn' styles from your global CSS if needed, or ensure 'btn' is included in your global style setup */
}
.start-quest-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(170, 108, 255, 0.4); 
}

.music-particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.note {
    position: absolute;
    color: white; 
    opacity: 0; 
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.start-quest-button:hover .music-particles .note {
    /* CRITICAL: Force the notes to be visible on hover */
    opacity: 1;}

.note::before {
    content: attr(data-symbol);
}

@keyframes float-and-fade {
    0% {
        opacity: 1;
        transform: translate(calc(-50% + var(--translate-x, 0)), -50%) scale(1);
    }
    100% {
        opacity: 0;
        transform: translate(calc(-50% + var(--translate-x, 0)), -70px) scale(0.5);
    }
}
</style>
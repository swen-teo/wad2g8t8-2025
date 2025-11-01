<template>
  <div class="quest-overlay" @click.self="closeQuest">
    <div class="card quest-card-modal quest-card-glass shadow-lg">
      <button class="btn-close-overlay btn-close-white" @click="closeQuest">&times;</button>

      <div class="modal-header border-bottom-0 header-music" style="border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;">
        <div class="d-flex align-items-center gap-3">
          <span class="music-badge"><i class="fa-solid fa-music"></i></span>
          <div>
            <h5 class="modal-title fw-bold m-0">{{ artistName }} Trivia</h5>
            <small class="text-muted">Test your music knowledge</small>
          </div>
        </div>
      </div>

      <div class="modal-body p-4 p-md-5">
        <div v-if="triviaLoading" class="text-center p-5">
          <div class="spinner-border qp-spinner" role="status"></div>
          <p class="mt-3 text-muted">Generating your trivia...</p>
        </div>

        <div v-else-if="triviaCompleted" class="text-center p-4">
          <h2 class="fw-bold">Trivia Complete!</h2>
          <h3
            class="display-4 fw-bold"
            :class="
              triviaScore === TRIVIA_QS ? 'text-success' : 'text-theme'
            "
          >
            {{ triviaScore }} / {{ TRIVIA_QS }}
          </h3>
          <p v-if="triviaScore === TRIVIA_QS" class="lead text-success">
            Perfect score! You earned {{ TRIVIA_AWARD }} points!
          </p>
          <p v-else class="lead text-theme">
            Nice try! You need a perfect score to earn the points. Feel free
            to try again.
          </p>
          <button class="btn btn-primary mt-3" @click="closeQuest">
            Close
          </button>
        </div>

        <div v-else-if="currentTriviaQuestion">
          <!-- Progress -->
          <div class="d-flex align-items-center justify-content-between mb-2 small text-muted">
            <span>Question {{ triviaCurrentIndex + 1 }} of {{ triviaQuestions.length }}</span>
            <span>{{ Math.round(((triviaCurrentIndex + 1) / triviaQuestions.length) * 100) }}%</span>
          </div>
          <div class="qp-progress mb-4" aria-hidden="true">
            <div class="qp-progress-bar" :style="{ width: (((triviaCurrentIndex + 1) / triviaQuestions.length) * 100) + '%' }"></div>
          </div>

          <h4 class="fw-bold mb-4 display-question">
            <i class="fas fa-record-vinyl me-2 question-icon"></i>
            {{ currentTriviaQuestion.question }}
          </h4>

          <!-- Options -->
          <div class="d-grid gap-3">
            <button
              v-for="(option, index) in (currentTriviaQuestion.options || currentTriviaQuestion.choices)"
              :key="index"
              class="btn btn-lg text-start trivia-option d-flex align-items-center justify-content-between"
              :class="{ active: selectedAnswer === option }"
              :aria-pressed="selectedAnswer === option"
              role="button"
              @click="selectedAnswer = option"
            >
              <div class="d-flex align-items-center gap-3">
                <span class="option-chip">{{ String.fromCharCode(65 + index) }}</span>
                <span class="option-text">{{ option }}</span>
              </div>
              <i class="far" :class="selectedAnswer === option ? 'fa-check-circle selected-icon' : 'fa-circle unselected-icon'"></i>
            </button>
          </div>
          <div class="d-flex justify-content-end mt-4">
            <button
              class="btn btn-primary"
              @click="submitAnswer"
              :disabled="selectedAnswer === null"
            >
              Next
              <i class="fas fa-arrow-right ms-2"></i>
            </button>
          </div>
        </div>

        <div v-else-if="triviaError" class="text-center p-4">
          <h4 class="text-danger">Error</h4>
          <p class="text-muted">{{ triviaError }}</p>
          <button class="btn btn-primary mt-3" @click="closeQuest">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles for the overlay (Copied from MusicQuest) */
.quest-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050; /* Above bootstrap navbar */
  backdrop-filter: blur(10px);
}

.quest-card-modal {
  position: relative;
  width: 90%;
  max-width: 800px; /* Trivia modal is larger (modal-lg) */
  border: none;
  animation: fadeIn 0.3s ease-out;
  /* Ensure modal body can scroll if content is tall */
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

/* * NEW: Glassmorphism Style
* (Same as MusicQuest)
*/
.quest-card-glass {
  background: #fff;
  color: var(--ink);
  border: 1px solid #eee;
  border-radius: var(--card-radius, 0.75rem);
  box-shadow: var(--elev-1, 0 8px 24px rgba(0,0,0,.12));
}

/* Header music accent */
.header-music {
  background: linear-gradient(90deg, rgba(167,139,250,0.08), rgba(96,165,250,0.08));
}
.music-badge {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(167,139,250,0.18);
  color: var(--primary-1);
}


.modal-body {
  overflow-y: auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.btn-close-overlay {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2rem;
  font-weight: 300;
  color: #ccc; /* White for dark bg */
  cursor: pointer;
  line-height: 1;
  padding: 0;
  z-index: 10;
  opacity: 0.8;
}
.btn-close-overlay:hover {
  color: #fff;
  opacity: 1;
}

/* * NEW: Trivia Option Button Styles 
* Replaces .btn-outline-secondary
*/
.trivia-option {
  background-color: #fff;
  border: 1px solid #eee;
  color: var(--ink);
  transition: all 0.2s ease;
  padding: 1rem 1.25rem;
  border-radius: 14px;
}

.trivia-option:hover {
  background-color: #f6f2ff; /* soft purple tint */
  border-color: var(--ring);
  color: var(--ink);
  transform: translateY(-1px);
}

/* Active/selected state */
.trivia-option.active {
  background: linear-gradient(135deg, rgba(167,139,250,0.18), rgba(96,165,250,0.18));
  border-color: #d8c7ff;
  color: var(--ink);
  box-shadow: 0 8px 24px rgba(125,120,255,.12);
}

/* Option chip (A/B/C/D) */
.option-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.9rem;
  color: #fff;
  background: linear-gradient(135deg, var(--primary-1), var(--primary-2));
  text-shadow: 0 1px 2px rgba(0,0,0,.25);
}

.option-text {
  line-height: 1.35;
}

.unselected-icon {
  color: #c9c9d6;
}
.selected-icon {
  color: var(--primary-1);
  text-shadow: 0 0 10px rgba(125,120,255,0.35);
}

/* Progress bar */
.qp-progress {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: #f2eefc;
  overflow: hidden;
}
.qp-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-1), var(--primary-2));
  transition: width 200ms ease;
}

/* Larger, more readable question text */
.display-question {
  line-height: 1.35;
}

/* Keyboard focus visibility */
.trivia-option:focus {
  outline: 2px solid rgba(216,199,255,0.9);
  outline-offset: 2px;
}

/* Theme helpers */
.text-theme {
  color: var(--primary-1) !important;
}
.qp-spinner {
  color: var(--primary-1);
}
.question-icon {
  color: var(--primary-1);
  opacity: 0.95;
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue';
// Import from the service file
import { generateQuizQuestions } from '../services/gemini-quiz.js';

// --- configuration ---
const TRIVIA_QS = 5; // 5 questions for a quicker demo
const TRIVIA_AWARD = 200;

// --- component setup ---
const props = defineProps({
  artistName: {
    type: String,
    required: true,
  },
  questData: {
    type: Object,
    required: true,
  },
});

// Add 'close' to emits
const emit = defineEmits(['update-progress', 'close']);

// --- local state ---
const triviaLoading = ref(true); // Start loading immediately
const triviaCompleted = ref(false);
const triviaQuestions = ref([]);
const triviaCurrentIndex = ref(0);
const selectedAnswer = ref(null);
const triviaScore = ref(0);
const triviaError = ref(null); // For handling API errors

// --- computed properties ---
const currentTriviaQuestion = computed(() => {
  return triviaQuestions.value[triviaCurrentIndex.value] || null;
});

// --- lifecycle ---
onMounted(() => {
  // Load questions immediately when the overlay is shown
  loadTriviaQuestions();
});

// --- quest 2: trivia ---

async function loadTriviaQuestions() {
  // Reset state
  triviaLoading.value = true;
  triviaCompleted.value = false;
  triviaQuestions.value = [];
  triviaCurrentIndex.value = 0;
  triviaScore.value = 0;
  selectedAnswer.value = null;
  triviaError.value = null;

  try {
    // Call the service
    const questions = await generateQuizQuestions(props.artistName);
    if (!questions || questions.length === 0) {
      throw new Error('No questions were returned for this artist.');
    }
    // limit to 5 questions
    triviaQuestions.value = questions.slice(0, TRIVIA_QS);
  } catch (e) {
    console.error('failed to load trivia:', e);
    triviaError.value = e.message || 'Could not load trivia questions.';
  } finally {
    triviaLoading.value = false;
  }
}

function submitAnswer() {
  if (selectedAnswer.value === null) return;

  const question = currentTriviaQuestion.value;
  // Handle 'correctAnswer' or 'answer' from your API
  const correctAnswer = question.correctAnswer || question.answer;

  if (selectedAnswer.value === correctAnswer) {
    triviaScore.value++;
  }

  // move to next question or finish
  if (triviaCurrentIndex.value < triviaQuestions.value.length - 1) {
    triviaCurrentIndex.value++;
    selectedAnswer.value = null;
  } else {
    finishTrivia();
  }
}

function finishTrivia() {
  triviaCompleted.value = true;
  // check for perfect score
  if (triviaScore.value === TRIVIA_QS) {
    // Emit progress to the parent
    emit('update-progress', {
      points: TRIVIA_AWARD,
      completed: true,
    });
    // Parent will hear this and close the overlay
  }
}

function closeQuest() {
  emit('close');
}
</script>
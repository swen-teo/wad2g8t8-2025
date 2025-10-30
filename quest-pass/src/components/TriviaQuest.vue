<template>
  <div class="quest-overlay" @click.self="closeQuest">
    <div class="card quest-card-modal quest-card-glass shadow-lg text-white">
      <button class="btn-close-overlay btn-close-white" @click="closeQuest">&times;</button>

      <div class="modal-header border-bottom-0" style="border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;">
        <h5 class="modal-title fw-bold">{{ artistName }} Trivia</h5>
      </div>

      <div class="modal-body p-4 p-md-5">
        <div v-if="triviaLoading" class="text-center p-5">
          <div class="spinner-border text-warning" role="status"></div>
          <p class="mt-3 text-white-75">Generating your trivia...</p>
        </div>

        <div v-else-if="triviaCompleted" class="text-center p-4">
          <h2 class="fw-bold">Trivia Complete!</h2>
          <h3
            class="display-4 fw-bold"
            :class="
              triviaScore === TRIVIA_QS ? 'text-success' : 'text-warning'
            "
          >
            {{ triviaScore }} / {{ TRIVIA_QS }}
          </h3>
          <p v-if="triviaScore === TRIVIA_QS" class="lead text-success">
            Perfect score! You earned {{ TRIVIA_AWARD }} points!
          </p>
          <p v-else class="lead text-warning">
            Nice try! You need a perfect score to earn the points. Feel free
            to try again.
          </p>
          <button class="btn btn-primary mt-3" @click="closeQuest">
            Close
          </button>
        </div>

        <div v-else-if="currentTriviaQuestion">
          <p class="text-white-75 small text-end">
            Question {{ triviaCurrentIndex + 1 }} of
            {{ triviaQuestions.length }}
          </p>
          <h4 class="fw-bold mb-4">
            {{ currentTriviaQuestion.question }}
          </h4>
          
          <div class="d-grid gap-3"> <button
              v-for="(option, index) in (currentTriviaQuestion.options || currentTriviaQuestion.choices)"
              :key="index"
              class="btn btn-lg text-start trivia-option"
              :class="{ active: selectedAnswer === option }"
              @click="selectedAnswer = option"
            >
              {{ option }}
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
          <p class="text-white-75">{{ triviaError }}</p>
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
  background: rgba(30, 30, 30, 0.75); 
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.75rem;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
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
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f0f0f0;
  transition: all 0.2s ease;
}

.trivia-option:hover {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  color: #fff;
}

/* Active/selected state */
.trivia-option.active {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  color: #fff;
  box-shadow: 0 0 15px rgba(var(--bs-primary-rgb), 0.5);
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
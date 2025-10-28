<template>
  <!-- Fullscreen Overlay Wrapper -->
  <div class="quest-overlay" @click.self="closeQuest">
    
    <!-- Quest Content Card (The Trivia Modal) -->
    <div class="card quest-card-modal shadow-lg">
      <!-- Close Button -->
      <button class="btn-close-overlay" @click="closeQuest">&times;</button>

      <!-- Trivia Modal Header -->
      <div class="modal-header">
        <h5 class="modal-title fw-bold">{{ artistName }} Trivia</h5>
      </div>
      
      <!-- Trivia Modal Body -->
      <div class="modal-body p-4 p-md-5">
        <!-- loading state -->
        <div v-if="triviaLoading" class="text-center p-5">
          <div class="spinner-border text-warning" role="status"></div>
          <p class="mt-3 text-muted">Generating your trivia...</p>
        </div>

        <!-- results state -->
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

        <!-- question state -->
        <div v-else-if="currentTriviaQuestion">
          <p class="text-muted small text-end">
            Question {{ triviaCurrentIndex + 1 }} of
            {{ triviaQuestions.length }}
          </p>
          <h4 class="fw-bold mb-4">
            {{ currentTriviaQuestion.question }}
          </h4>
          <!-- Note: Your API must return 'options' or 'choices' -->
          <div class="d-grid gap-2">
            <button
              v-for="(option, index) in (currentTriviaQuestion.options || currentTriviaQuestion.choices)"
              :key="index"
              class="btn btn-outline-secondary btn-lg text-start"
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
        
        <!-- Error State -->
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
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050; /* Above bootstrap navbar */
  backdrop-filter: blur(5px);
}

.quest-card-modal {
  position: relative;
  width: 90%;
  max-width: 800px; /* Trivia modal is larger (modal-lg) */
  border: none;
  border-radius: 0.5rem;
  animation: fadeIn 0.3s ease-out;
  /* Ensure modal body can scroll if content is tall */
  max-height: 90vh;
  display: flex;
  flex-direction: column;
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
  color: #6c757d;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  z-index: 10;
}
.btn-close-overlay:hover {
  color: #000;
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue';
// Import from the service file
import { generateQuizQuestions } from '../services/gemini-quiz.js';
// Bootstrap Modal is no longer needed
// import { Modal } from 'bootstrap';

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
// const triviaModal = ref(null); // No longer needed

// trivia state
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

/**
 * Loads questions by calling the trivia service.
 */
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


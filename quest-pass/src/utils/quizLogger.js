const DEBUG_ENABLED = import.meta.env.VITE_QUIZ_DEBUG_LOGS === 'true';

const TAG = '%c[TriviaQuest]';
const SUCCESS_STYLE = 'color:#16a34a;font-weight:600;';
const WARN_STYLE = 'color:#d97706;font-weight:600;';
const ERROR_STYLE = 'color:#dc2626;font-weight:600;';

export function logTriviaSuccess(message, ...args) {
  console.info(TAG, SUCCESS_STYLE, message, ...args);
}

export function logTriviaWarn(message, ...args) {
  if (!DEBUG_ENABLED) return;
  console.warn(TAG, WARN_STYLE, message, ...args);
}

export function logTriviaError(message, ...args) {
  if (!DEBUG_ENABLED) return;
  console.error(TAG, ERROR_STYLE, message, ...args);
}

import { firebaseConfig } from '@/firebase.js';
import {
  logTriviaError,
  logTriviaSuccess,
  logTriviaWarn,
} from '@/utils/quizLogger.js';

/**
 * Generates quiz questions by fetching from the secure backend.
 * @param {string} artist - The name of the artist for the quiz.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of question objects.
 */

const CLOUD_FUNCTION_URL = firebaseConfig?.projectId
  ? `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/generateQuiz`
  : null;

// Prefer the deployed Cloud Function whenever we know the project ID so browsers
// don't spam the console with "Failed to load resource" errors when the local
// `/api/quiz` proxy isn't running, but keep the local proxy around as a fallback
// for when the remote endpoint is temporarily unhappy in development.
const RETRYABLE_STATUS = new Set([500, 502, 503, 504, 404, 429]);
const MAX_ATTEMPTS_PER_ENDPOINT = 3;

export async function generateQuizQuestions(artist) {
  // we're fetching from a secure backend
  const endpoints = buildEndpointPreferenceList();
  let lastError = null;

  for (let endpointIndex = 0; endpointIndex < endpoints.length; endpointIndex += 1) {
    const endpoint = endpoints[endpointIndex];
    const endpointLabel = describeEndpoint(endpoint);

    let attempt = 0;
    while (attempt < MAX_ATTEMPTS_PER_ENDPOINT) {
      attempt += 1;
      let response;

      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ artist }),
        });
      } catch (networkError) {
        // Treat network failures like retryable errors, but rethrow if this was an abort.
        if (networkError?.name === 'AbortError') {
          throw networkError;
        }
        lastError = networkError;
        logTriviaWarn(
          `Quiz request to ${endpointLabel} failed due to a network error, retrying…`,
          networkError
        );
        await new Promise((resolve) => setTimeout(resolve, getRetryDelay(attempt)));
        continue;
      }

      if (response.ok) {
        const payload = await response.json(); // gemini ai-generated quiz array
        const count = Array.isArray(payload) ? payload.length : 0;
        logTriviaSuccess(`Loaded ${count} trivia question${count === 1 ? '' : 's'} from ${endpointLabel}.`);
        return payload;
      }

      if (RETRYABLE_STATUS.has(response.status)) {
        lastError = Object.assign(new Error(`HTTP ${response.status}`), {
          status: response.status,
        });
        const retryReason =
          response.status === 429
            ? 'rate limiting this client'
            : `returning HTTP ${response.status}`;
        logTriviaWarn(
          `Quiz request to ${endpointLabel} is ${retryReason}; retrying attempt ${
            attempt + 1
          } after backoff.`
        );
        await new Promise((resolve) => setTimeout(resolve, getRetryDelay(attempt)));
        continue;
      }

      const errorDetails = await parseErrorResponse(response);

      if (
        errorDetails.normalizedContext.includes('status code 503') ||
        errorDetails.normalizedContext.includes('service unavailable')
      ) {
        lastError = new Error(errorDetails.message);
        logTriviaWarn('Quiz request reported temporary unavailability; retrying after backoff.', {
          status: response.status,
          detail: errorDetails.detail,
          extra: errorDetails.extra,
        });
        await new Promise((resolve) => setTimeout(resolve, getRetryDelay(attempt)));
        continue;
      }

      logTriviaError(errorDetails.message);
      throw new Error(errorDetails.message);
    }

    if (endpointIndex < endpoints.length - 1) {
      logTriviaWarn(
        `Quiz endpoint ${endpointLabel} failed after ${MAX_ATTEMPTS_PER_ENDPOINT} attempts; trying fallback.`,
        lastError || undefined
      );
    }
  }

  const failureMessage = lastError?.status === 429
    ? 'The quiz backend is temporarily rate limiting requests. Please wait a few moments before trying again.'
    : 'Failed to fetch quiz from any configured endpoint. Please verify your Firebase project or local proxy.';
  logTriviaError(failureMessage, lastError || undefined);
  throw new Error(failureMessage);
}

function buildEndpointPreferenceList() {
  const explicit = import.meta.env.VITE_QUIZ_API_URL;
  if (explicit) {
    return [explicit];
  }

  const endpoints = [];
  if (CLOUD_FUNCTION_URL) {
    endpoints.push(CLOUD_FUNCTION_URL);
  }
  endpoints.push('/api/quiz');
  return endpoints;
}

async function parseErrorResponse(response) {
  // Try to surface server error details to the UI
  let detail = '';
  let extra = '';
  try {
    const ct = response.headers.get('Content-Type') || '';
    if (ct.includes('application/json')) {
      const j = await response.json();
      // Prefer message/error, but include server-provided details/status if present
      const primary = j?.message || j?.error;
      const details = j?.details
        ? ` Details: ${typeof j.details === 'string' ? j.details : JSON.stringify(j.details)}`
        : '';
      const statusInfo =
        j?.status && j?.status !== response.status ? ` (upstream status ${j.status})` : '';
      detail = primary || '';
      extra = `${statusInfo}${details}`.trim();
      if (!detail) {
        // Fall back to entire JSON if no primary message
        detail = JSON.stringify(j);
      }
    } else {
      detail = await response.text();
    }
  } catch {}
  const context = [detail, extra].filter(Boolean).join(' ').trim();
  const message = `Failed to fetch quiz from backend (HTTP ${response.status}). ${context}`.trim();
  return {
    message,
    detail,
    extra,
    normalizedContext: context.toLowerCase(),
  };
}

function describeEndpoint(endpoint) {
  if (!endpoint) return 'unknown endpoint';
  if (endpoint === '/api/quiz') {
    return 'local proxy (/api/quiz)';
  }
  try {
    const url = new URL(endpoint);
    return `${url.hostname}${url.pathname}`;
  } catch {
    return endpoint;
  }
}

function getRetryDelay(attempt) {
  const BASE_DELAY = 1000; // 1 second
  const MAX_DELAY = 5000; // 5 seconds max between attempts
  const jitter = Math.random() * 250; // add a little jitter to avoid thundering herd
  const delay = Math.min(BASE_DELAY * 2 ** (attempt - 1), MAX_DELAY);
  return delay + jitter;
}

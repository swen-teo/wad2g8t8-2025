/**
 * Generates quiz questions by fetching from the secure backend.
 * @param {string} artist - The name of the artist for the quiz.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of question objects.
 */
export async function generateQuizQuestions(artist) {
  // we're fetching from a secure backend
  const QUIZ_API_URL = import.meta.env.VITE_QUIZ_API_URL || '/api/quiz';
  const response = await fetch(QUIZ_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artist }),
  });

  if (!response.ok) {
    // Try to surface server error details to the UI
    let detail = '';
    let extra = '';
    try {
      const ct = response.headers.get('Content-Type') || '';
      if (ct.includes('application/json')) {
        const j = await response.json();
        // Prefer message/error, but include server-provided details/status if present
        const primary = j?.message || j?.error;
        const details = j?.details ? ` Details: ${typeof j.details === 'string' ? j.details : JSON.stringify(j.details)}` : '';
        const statusInfo = j?.status && j?.status !== response.status ? ` (upstream status ${j.status})` : '';
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
    const msg = `Failed to fetch quiz from backend (HTTP ${response.status}). ${[detail, extra].filter(Boolean).join(' ')}`.trim();
    throw new Error(msg);
  }

  return await response.json(); // gemini ai-generated quiz array
}

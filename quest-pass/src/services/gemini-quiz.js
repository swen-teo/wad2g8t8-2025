/**
 * Generates quiz questions by fetching from the secure backend.
 * @param {string} artist - The name of the artist for the quiz.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of question objects.
 */
export async function generateQuizQuestions(artist) {
  // we're fetching from a secure backend
  const response = await fetch(
    'https://turbo-fiesta-6v96v6q7xw73gxw-3000.app.github.dev/api/quiz',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artist }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch quiz from backend.');
  }

  return await response.json(); // gemini ai-generated quiz array
}

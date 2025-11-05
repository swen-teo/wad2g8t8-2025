import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'
import axios from 'axios'

function quizApiPlugin(geminiKey) {
  return {
    name: 'quiz-api-dev-middleware',
    configureServer(server) {
  server.middlewares.use('/api/quiz', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method Not Allowed' }))
          return
        }

        try {
          // Read JSON body
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const bodyStr = Buffer.concat(chunks).toString('utf8')
          const payload = JSON.parse(bodyStr || '{}')
          const artist = String(payload.artist || '').trim()

          if (!artist) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Missing artist' }))
            return
          }

          if (!geminiKey) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'GEMINI_API_KEY missing' }))
            return
          }

          const prompt = `You are a music trivia generator. Create exactly 5 multiple-choice questions about the artist "${artist}". Return ONLY a JSON array with items of the form: {"question": string, "options": [string, string, string, string], "correctAnswer": string}. Avoid duplicates; ensure the correctAnswer is one of the options. Keep questions concise.`

          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiKey)}`
          const { data } = await axios.post(url, {
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              // Prefer snake_case per Generative Language API HTTP spec
              temperature: 0.7,
              max_output_tokens: 1024,
              response_mime_type: 'application/json',
            },
          }, {
            timeout: 15000,
          })

          const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
          // Remove potential code fences if model wrapped response
          const text = String(raw).replace(/```json|```/g, '').trim()

          let quiz
          try {
            quiz = JSON.parse(text)
          } catch (_) {
            // Try to extract JSON array fallback safely
            try {
              const match = text.match(/\[[\s\S]*\]/)
              quiz = match ? JSON.parse(match[0]) : null
            } catch {
              quiz = null
            }
          }

          if (!Array.isArray(quiz) || quiz.length === 0) {
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Invalid model response' }))
            return
          }

          // Normalize items and limit to 5
          const normalized = quiz.slice(0, 5).map((q) => ({
            question: String(q.question || q.prompt || '').trim(),
            options: Array.isArray(q.options || q.choices) ? (q.options || q.choices).map(String) : [],
            correctAnswer: String(q.correctAnswer || q.answer || '').trim(),
          })).filter(q => q.question && q.options.length >= 2)

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(normalized))
        } catch (err) {
          // Log rich error details to aid debugging
          const httpData = err?.response?.data;
          const httpStatus = err?.response?.status;
          console.error('[quiz-api] error:', httpStatus, httpData || err);
          // Prefer upstream status when available (e.g., 400/403)
          res.statusCode = httpStatus || 500
          res.setHeader('Content-Type', 'application/json')
          // Try to extract a human-readable message from upstream error if present
          const upstreamMsg = (httpData && (httpData.error?.message || httpData.message)) || null;
          res.end(JSON.stringify({
            error: upstreamMsg || 'Quiz generation failed',
            status: httpStatus || 500,
            details: httpData || String(err?.message || err),
          }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const GEMINI_KEY = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ''

  return {
    plugins: [vue(), quizApiPlugin(GEMINI_KEY)],
    resolve: {
      alias: {
        // allow imports using `@/...` to reference the `src` directory
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: 3000
    }
  }
})

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({ origin: true });
const stripe = require("stripe");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const { Timestamp, FieldValue } = admin.firestore;

// Populate Events from Jambase
exports.populateEventsFromJambase = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "GET" && req.method !== "POST")
      return res.status(405).send("Method Not Allowed");

    try {
      const apiKey = process.env.JAMBASE_KEY;
      if (!apiKey) throw new Error("JAMBASE_KEY secret is not set.");

      const jambaseUrl = `https://www.jambase.com/jb-api/v1/events?apikey=${apiKey}&o=json`;
      const response = await axios.get(jambaseUrl);

      const apiEvents = response.data?.events || [];
      console.log(`Fetched ${apiEvents.length} events.`);

      const chunkSize = 500;
      for (let i = 0; i < apiEvents.length; i += chunkSize) {
        const batch = db.batch();
        apiEvents.slice(i, i + chunkSize).forEach((apiEvent) => {
          const artist = apiEvent.performer?.[0]?.name || "Various Artists";
          const venue = apiEvent._embedded?.venues?.[0] || {};
          const venueName = venue?.name || "Venue TBA";
          const venueLocation = venue?.city?.name
            ? `${venue.city.name}, ${venue.state?.name || ""}`
            : "Location TBA";

          const startDateTime =
            apiEvent.dates?.start?.dateTime ||
            `${apiEvent.dates?.start?.localDate}T${apiEvent.dates?.start?.localTime || "18:00:00"}`;
          const startDate = startDateTime ? new Date(startDateTime) : null;
          const endDateTime = apiEvent.dates?.end?.dateTime;
          const endDate = endDateTime ? new Date(endDateTime) : null;

          const docData = {
            jambaseId: apiEvent.id,
            title: apiEvent.name,
            description: apiEvent.description || `See ${artist} live at ${venueName}!`,
            artistName: artist,
            venue: { name: venueName, location: venueLocation },
            bannerImage: apiEvent.images?.find((img) => img.url)?.url || "https://placehold.co/1200x400/a78bfa/ffffff?text=Event",
            cardImage: apiEvent.images?.find((img) => img.width >= 640)?.url || "https://placehold.co/600x400/a78bfa/ffffff?text=Event",
            date: startDate ? startDate.toISOString() : "Date TBA",
            startDate: startDate ? Timestamp.fromDate(startDate) : null,
            endDate: endDate ? Timestamp.fromDate(endDate) : null,
            rewardPointsGoal: 1000,
            status: "upcoming",
            updatedAt: FieldValue.serverTimestamp(),
            source: "jambase",
          };

          const eventRef = db.collection("events").doc(String(apiEvent.id));
          batch.set(eventRef, docData, { merge: true });
        });

        await batch.commit();
      }

      res.status(200).send(`Successfully populated ${apiEvents.length} events.`);
    } catch (err) {
      console.error("Jambase population error:", err);
      res.status(500).send(err.message);
    }
  });
});


// Generate Gemini Quiz for Trivia
async function requestGeminiQuiz(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const { data } = await axios.post(
    url,
    {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, max_output_tokens: 1024, responseMimeType: "application/json" },
    },
    { timeout: 15000 }
  );

  const candidate = data?.candidates?.[0];
  if (!candidate) return { questions: [], reason: "NO_CANDIDATE" };

  let raw = candidate?.content?.parts?.[0]?.text || "";
  raw = raw.replace(/```json|```/g, "").trim();

  let quiz;
  try {
    quiz = JSON.parse(raw);
  } catch {
    // Try to extract the first valid JSON array from the string
    const arrMatch = raw.match(/\[[^\]]*\](?![\s\S]*\[[^\]]*\])/s);
    if (arrMatch) {
      try {
        quiz = JSON.parse(arrMatch[0]);
      } catch {
        quiz = [];
      }
    } else {
      // Try to extract any JSON array (greedy)
      const fallbackMatch = raw.match(/\[[\s\S]*\]/);
      try {
        quiz = fallbackMatch ? JSON.parse(fallbackMatch[0]) : [];
      } catch {
        quiz = [];
      }
    }
  }

  return (Array.isArray(quiz) ? quiz : [])
    .slice(0, 5)
    .map((q) => ({
      question: String(q.question || q.prompt || "").trim(),
      options: Array.isArray(q.options || q.choices) ? (q.options || q.choices).map(String) : [],
      correctAnswer: String(q.correctAnswer || q.answer || "").trim(),
    }))
    .filter((q) => q.question && q.options.length >= 2 && q.correctAnswer);
}

exports.generateQuiz = functions
  .https.onRequest((req, res) => {
    cors(req, res, async () => {
      if (req.method === "OPTIONS") return res.status(204).send("");
      if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

      try {
        const artist = String(req.body.artist || "").trim();
        if (!artist) return res.status(400).json({ error: "Missing artist" });

        const apiKey = process.env.VITE_GEMINI_API_KEY;
        if (!apiKey) return res.status(500).json({ error: "VITE_GEMINI_API_KEY not configured" });

        const prompt = `You are a music trivia generator. Create exactly 5 multiple-choice questions about the artist "${artist}". Return ONLY a JSON array with {"question": string, "options": [string, string, string, string], "correctAnswer": string}.`;

        const questions = await requestGeminiQuiz(apiKey, prompt);

        if (!questions.length) return res.status(502).json({ error: "Invalid model response" });

        res.json(questions);
      } catch (err) {
        console.error("generateQuiz error:", err?.response?.data || err);
        res.status(500).json({ error: "Quiz generation failed", details: err.message });
      }
  });
});

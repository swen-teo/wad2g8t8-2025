
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();
const { Timestamp, FieldValue } = admin.firestore;

// Define the secret name
// This tells the function it needs to access this secret
const JAMBASE_API_KEY_SECRET = "JAMBASE_KEY";

/**
 * Formats a human readable date string for event cards/details.
 * @param {Date|null} startDate
 * @param {string} venueName
 * @returns {string}
 */
function formatDisplayDate(startDate, venueName = "") {
  if (!startDate) {
    return venueName ? `Date TBA · ${venueName}` : "Date TBA";
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const formatted = formatter.format(startDate);
  return venueName ? `${formatted} · ${venueName}` : formatted;
}

/**
 * Determines whether an event is current/upcoming/past based on its dates.
 * @param {Date|null} startDate
 * @param {Date|null} endDate
 * @returns {"current"|"upcoming"|"past"}
 */
function resolveStatus(startDate, endDate) {
  if (!startDate) {
    return "upcoming";
  }

  const now = new Date();
  const effectiveEnd = endDate || new Date(startDate.getTime() + 3 * 60 * 60 * 1000);

  if (now >= startDate && now <= effectiveEnd) {
    return "current";
  }

  return now < startDate ? "upcoming" : "past";
}

/**
 * Builds the Firestore document payload for an event.
 */
function buildEventDocument({
  id,
  title,
  description,
  artistName,
  venueName,
  venueLocation,
  bannerImage,
  cardImage,
  startDate,
  endDate,
  status,
  source = "jambase",
  rewardPointsGoal = 1000,
  extraData = {},
}) {
  const start = startDate instanceof Date ? startDate : startDate ? new Date(startDate) : null;
  const end = endDate instanceof Date ? endDate : endDate ? new Date(endDate) : null;
  const finalStatus = status || resolveStatus(start, end);

  return {
    jambaseId: source === "jambase" ? id : null,
    title,
    description,
    artistName,
    venue: {
      name: venueName || "Venue TBA",
      location: venueLocation || "Location TBA",
    },
    bannerImage:
      bannerImage || "https://placehold.co/1200x400/a78bfa/ffffff?text=Event",
    cardImage:
      cardImage || bannerImage || "https://placehold.co/600x400/a78bfa/ffffff?text=Event",
    date: formatDisplayDate(start, venueName),
    startDate: start ? Timestamp.fromDate(start) : null,
    endDate: end ? Timestamp.fromDate(end) : null,
    rewardPointsGoal,
    status: finalStatus,
    updatedAt: FieldValue.serverTimestamp(),
    source,
    ...extraData,
  };
}

/**
 * An HTTP-triggered Cloud Function that:
 * 1. Fetches events from the Jambase API.
 * 2. Adds curated QuestPass events.
 * 3. Saves them to the 'events' collection in Firestore.
 */
exports.populateEventsFromJambase = functions
  .runWith({
    timeoutSeconds: 120,
    memory: "1GB",
    // This line "opts-in" to the secret
    secrets: [JAMBASE_API_KEY_SECRET],
  })
  .https.onRequest(async (req, res) => {
    try {
      console.log("Starting Jambase event population...");
      
      // Get the API key from process.env
      // On deploy, this comes from the "secret"
      // Locally, it comes from your new `functions/.env` file
      const apiKey = process.env[JAMBASE_API_KEY_SECRET];

      if (!apiKey) {
        throw new Error("JAMBASE_KEY secret is not set or available.");
      }

      // 1. Fetch events from Jambase
      const jambaseUrl = `https://www.jambase.com/jb-api/v1/events?apikey=${apiKey}&o=json`;
      const response = await axios.get(jambaseUrl);

      if (!response.data || !response.data.events) {
        throw new Error("Invalid response from Jambase API");
      }

      const apiEvents = response.data.events;
      console.log(`Fetched ${apiEvents.length} events from Jambase.`);

      const batch = db.batch();
      let processedCount = 0;

      // 2. Loop through and transform each event
      apiEvents.forEach((apiEvent) => {
        const artist = apiEvent.performer?.[0]?.name || "Various Artists";
        const venue = apiEvent._embedded?.venues?.[0];
        const venueName = venue?.name || "Venue TBA";
        const venueLocation = venue?.city?.name
          ? `${venue.city.name}, ${venue.state?.name || ""}`
          : "Location TBA";

        const bannerImage =
          apiEvent.images?.find((img) => img.url)?.url ||
          "https://placehold.co/1200x400/a78bfa/ffffff?text=Event";
        const cardImage =
          apiEvent.images?.find((img) => img.width >= 640)?.url || bannerImage;

        const startDateTime =
          apiEvent.dates?.start?.dateTime ||
          `${apiEvent.dates?.start?.localDate}T${
            apiEvent.dates?.start?.localTime || "18:00:00"
          }`;
        const startDate = startDateTime ? new Date(startDateTime) : null;
        const endDateTime = apiEvent.dates?.end?.dateTime;
        const endDate = endDateTime ? new Date(endDateTime) : null;

        const newEvent = buildEventDocument({
          id: apiEvent.id,
          title: apiEvent.name,
          description: apiEvent.description || `See ${artist} live at ${venueName}!`,
          artistName: artist,
          venueName,
          venueLocation,
          bannerImage,
          cardImage,
          startDate,
          endDate,
        });

        // 3. Save to Firestore
        const eventRef = db.collection("events").doc(String(apiEvent.id));
        batch.set(eventRef, newEvent, { merge: true });
        processedCount++;
      });

      const curatedEvents = [
        {
          id: "questpass-live-night",
          title: "QuestPass Live: Midnight Encore",
          description:
            "Join fellow fans for an exclusive QuestPass takeover featuring live sets, trivia quests, and limited-time rewards.",
          artistName: "QuestPass Collective",
          venueName: "QuestPass Arena",
          venueLocation: "Virtual Stage",
          bannerImage:
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80",
          cardImage:
            "https://images.unsplash.com/photo-1512427691650-1e0c0d57589f?auto=format&fit=crop&w=1200&q=80",
          startDate: new Date(Date.now() - 30 * 60 * 1000),
          endDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
          status: "current",
          source: "questpass",
          extraData: {
            spotlight: true,
          },
        },
        {
          id: "questpass-meetup-city",
          title: "QuestPass City Meetup",
          description:
            "Connect with other QuestPass explorers in your city for a night of music quests, rewards, and exclusive drops.",
          artistName: "Community DJs",
          venueName: "Downtown Listening Lounge",
          venueLocation: "Singapore",
          bannerImage:
            "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1600&q=80",
          cardImage:
            "https://images.unsplash.com/photo-1492683513054-55277abccd50?auto=format&fit=crop&w=1200&q=80",
          startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
          status: "upcoming",
          source: "questpass",
          extraData: {
            spotlight: true,
          },
        },
      ];

      curatedEvents.forEach((event) => {
        const curatedDoc = buildEventDocument(event);
        const eventRef = db.collection("events").doc(event.id);
        batch.set(eventRef, curatedDoc, { merge: true });
        processedCount++;
      });

      // Commit the batch of writes to Firestore
      await batch.commit();

      const successMsg = `Successfully populated/updated ${processedCount} events in Firestore.`;
      console.log(successMsg);
      res.status(200).send(successMsg);

    } catch (error) {
      console.error("Error populating Jambase events:", error);
      res.status(500).send(`Error: ${error.message}`);
    }
  });

/*
 * GENERATE REWARD CODE ON EVENT CREATE
 * This function is triggered automatically *every time* a new
 * document is created in the 'events' collection.
 */

// Helper function to generate a random code
const generateRandomCode = () => {
  // Using chars that aren't easy to mix up (e.g., no 'O' or '0')
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
  let result = 'QUEST-';
  for (let i = 0; i < 8; i++) {
    if (i === 4) result += '-';
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

exports.generateRewardCodeOnEventCreate = functions.firestore
  .document('events/{eventId}')
  .onCreate(async (snapshot, context) => {
    // 1. Get the new event's data and reference
    const eventData = snapshot.data();
    const eventRef = snapshot.ref;
    const eventId = context.params.eventId;

    // 2. Check if it already has a code (it shouldn't, but it's safe)
    if (eventData.rewardCode) {
      console.log(`Event ${eventId} already has a code. Skipping.`);
      return null;
    }

    // 3. Generate a new, unique code
    const newCode = generateRandomCode();
    console.log(`Generated code ${newCode} for event ${eventId}.`);

    // 4. Update the event document with the new code
    try {
      await eventRef.update({ rewardCode: newCode });
      return { status: 'ok', code: newCode };
    } catch (error) {
      console.error('Failed to update event with reward code:', error);
      return null;
    }
  });

/**
 * Generate a 5-question multiple-choice quiz using Gemini.
 * POST { artist: string } -> [{ question, options: string[], correctAnswer }]
 * Uses secret GEMINI_API_KEY; falls back to VITE_GEMINI_API_KEY in local .env for convenience.
 */
exports.generateQuiz = functions
  .runWith({
    timeoutSeconds: 20,
    memory: "256MB",
    secrets: ["GEMINI_API_KEY"],
  })
  .https.onRequest(async (req, res) => {
    // Basic CORS (adjust for your hosting as needed)
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    try {
      const artist = String((req.body && req.body.artist) || "").trim();
      if (!artist) return res.status(400).json({ error: "Missing artist" });

      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

      const prompt = `You are a music trivia generator. Create exactly 5 multiple-choice questions about the artist "${artist}". Return ONLY a JSON array with items of the form: {"question": string, "options": [string, string, string, string], "correctAnswer": string}. Avoid duplicates; ensure the correctAnswer is one of the options. Keep questions concise.`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
      const { data } = await axios.post(
        url,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            // Prefer snake_case per Generative Language API HTTP spec
            temperature: 0.7,
            max_output_tokens: 1024,
            response_mime_type: "application/json",
          },
        },
        { timeout: 15000 }
      );

      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      // Remove code fences if present
      const text = String(raw).replace(/```json|```/g, '').trim();
      let quiz;
      try {
        quiz = JSON.parse(text);
      } catch (_) {
        try {
          const match = text.match(/\[[\s\S]*\]/);
          quiz = match ? JSON.parse(match[0]) : null;
        } catch {
          quiz = null;
        }
      }

      if (!Array.isArray(quiz) || quiz.length === 0) {
        return res.status(502).json({ error: "Invalid model response" });
      }

      const normalized = quiz
        .slice(0, 5)
        .map((q) => ({
          question: String(q.question || q.prompt || "").trim(),
          options: Array.isArray(q.options || q.choices)
            ? (q.options || q.choices).map(String)
            : [],
          correctAnswer: String(q.correctAnswer || q.answer || "").trim(),
        }))
        .filter((q) => q.question && q.options.length >= 2);

      return res.json(normalized);
    } catch (err) {
      console.error("generateQuiz error:", err?.response?.data || err);
      return res.status(500).json({ error: "Quiz generation failed", details: String(err?.message || err) });
    }
  });
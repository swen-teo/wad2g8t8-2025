const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const Stripe = require("stripe");

admin.initializeApp();
const db = admin.firestore();
const { Timestamp, FieldValue } = admin.firestore;

const JAMBASE_API_KEY_SECRET = "JAMBASE_KEY";
let stripe; // <-- 1. Define stripe here, but don't initialize it

// Create a payment intent
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
// 2. Add this "if" block to initialize stripe on the first run
if (!stripe) {
  stripe = Stripe(functions.config().stripe.secret);
  }
  try {
    // Uncomment this before production
    // if (!context.auth) {
    //   throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    // }

    const amount = data.amount;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    return { clientSecret: paymentIntent.client_secret };
  } catch (error) {
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
});

// Format readable date
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

// Determine event status
function resolveStatus(startDate, endDate) {
  if (!startDate) return "upcoming";

  const now = new Date();
  const effectiveEnd = endDate || new Date(startDate.getTime() + 3 * 60 * 60 * 1000);

  if (now >= startDate && now <= effectiveEnd) return "current";
  return now < startDate ? "upcoming" : "past";
}

// Build Firestore event document
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

// Populate events from Jambase
exports.populateEventsFromJambase = functions
  .runWith({
    timeoutSeconds: 120,
    memory: "1GB",
    secrets: [JAMBASE_API_KEY_SECRET],
  })
  .https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") return res.status(204).send("");

    try {
      console.log("Starting Jambase event population...");

      const apiKey = process.env[JAMBASE_API_KEY_SECRET];
      if (!apiKey) throw new Error("JAMBASE_KEY secret is not set or available.");

      const jambaseUrl = `https://www.jambase.com/jb-api/v1/events?apikey=${apiKey}&o=json`;
      const response = await axios.get(jambaseUrl);

      if (!response.data || !response.data.events) {
        throw new Error("Invalid response from Jambase API");
      }

      const apiEvents = response.data.events;
      console.log(`Fetched ${apiEvents.length} events from Jambase.`);

      const batch = db.batch();
      let processedCount = 0;

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
          `${apiEvent.dates?.start?.localDate}T${apiEvent.dates?.start?.localTime || "18:00:00"}`;
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

        const eventRef = db.collection("events").doc(String(apiEvent.id));
        batch.set(eventRef, newEvent, { merge: true });
        processedCount++;
      });

      await batch.commit();
      res.status(200).send(`Successfully populated ${processedCount} events.`);
    } catch (error) {
      console.error("Error populating Jambase events:", error);
      res.status(500).send(`Error: ${error.message}`);
    }
  });

// Reward code generator
function buildArtistPrefix(artistName, fallback = "QUESTPASS") {
  if (!artistName) return fallback;

  const normalized = artistName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

  return normalized.substring(0, 18) || fallback;
}

function generateRewardCode(eventData = {}) {
  const prefix = buildArtistPrefix(eventData.artistName || eventData.title);
  const randomFiveDigit = Math.floor(Math.random() * 90000) + 10000;
  return `${prefix}-${randomFiveDigit}`;
}

exports.generateRewardCodeOnEventCreate = functions.firestore
  .document("events/{eventId}")
  .onCreate(async (snapshot, context) => {
    const eventData = snapshot.data();
    const eventRef = snapshot.ref;
    const eventId = context.params.eventId;

    if (eventData.rewardCode) {
      console.log(`Event ${eventId} already has a code. Skipping.`);
      return null;
    }

    const newCode = generateRewardCode(eventData);
    console.log(`Generated code ${newCode} for event ${eventId}.`);

    try {
      await eventRef.update({ rewardCode: newCode });
      return { status: "ok", code: newCode };
    } catch (error) {
      console.error("Failed to update event with reward code:", error);
      return null;
    }
  });

// Gemini Quiz Generator
async function requestGeminiQuiz(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const { data } = await axios.post(
    url,
    {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        max_output_tokens: 1024,
        responseMimeType: "application/json",
      },
    },
    { timeout: 15000 }
  );

  const candidate = data?.candidates?.[0];
  if (!candidate) return { questions: [], reason: "NO_CANDIDATE" };

  const part = candidate?.content?.parts?.[0] || {};
  let raw = "";
  if (part.inlineData?.data) {
    try {
      raw = Buffer.from(part.inlineData.data, "base64").toString("utf8");
    } catch (decodeErr) {
      console.error("Failed to decode inlineData", decodeErr);
    }
  }
  if (!raw && typeof part.text === "string") {
    raw = part.text;
  }

  const text = String(raw).replace(/```json|```/g, "").trim();
  let quiz;
  try {
    quiz = JSON.parse(text);
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    quiz = match ? JSON.parse(match[0]) : [];
  }

  const cleaned = (Array.isArray(quiz) ? quiz : [])
    .slice(0, 5)
    .map((q) => ({
      question: String(q.question || q.prompt || "").trim(),
      options: Array.isArray(q.options || q.choices)
        ? (q.options || q.choices).map(String)
        : [],
      correctAnswer: String(q.correctAnswer || q.answer || "").trim(),
    }))
    .filter((q) => q.question && q.options.length >= 2 && q.correctAnswer);

  return { questions: cleaned, reason: cleaned.length ? null : "INVALID_RESPONSE" };
}

exports.generateQuiz = functions
  .runWith({
    timeoutSeconds: 20,
    memory: "256MB",
    secrets: ["GEMINI_API_KEY"],
  })
  .https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    try {
      const artist = String(req.body.artist || "").trim();
      if (!artist) return res.status(400).json({ error: "Missing artist" });

      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

      const prompt = `You are a music trivia generator. Create exactly 5 multiple-choice questions about the artist "${artist}". Return ONLY a JSON array with {"question": string, "options": [string, string, string, string], "correctAnswer": string}.`;

      const { questions, reason } = await requestGeminiQuiz(apiKey, prompt);
      if (questions.length) {
        return res.json(questions);
      } else {
        console.warn(`Gemini quiz returned no questions (${reason}).`);
        return res.status(502).json({ error: "Invalid model response", details: reason });
      }
    } catch (err) {
      console.error("generateQuiz error:", err?.response?.data || err);
      return res.status(500).json({
        error: "Quiz generation failed",
        details: String(err?.message || err),
      });
    }
  });

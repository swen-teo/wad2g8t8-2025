
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

// Define the secret name
// This tells the function it needs to access this secret
const JAMBASE_API_KEY_SECRET = "JAMBASE_KEY";

/**
 * An HTTP-triggered Cloud Function that:
 * 1. Fetches events from the Jambase API.
 * 2. Transforms them into our app's data structure.
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
        const venueName = venue?.name || "TBA";
        const venueLocation = venue?.city?.name
          ? `${venue.city.name}, ${venue.state?.name || ""}`
          : "TBA";
        
        const bannerImage =
          apiEvent.images?.find((img) => img.url)?.url ||
          "https://placehold.co/1200x400/a78bfa/ffffff?text=Event";

        const newEvent = {
          jambaseId: apiEvent.id,
          title: apiEvent.name,
          date: `${apiEvent.dates.start.localDate} at ${venueName}`,
          description: apiEvent.description || `See ${artist} live at ${venueName}!`,
          artistName: artist,
          venue: {
            name: venueName,
            location: venueLocation,
          },
          bannerImage: bannerImage,
          rewardPointsGoal: 1000, 
          rewardCode: null,
        };

        // 3. Save to Firestore
        const eventRef = db.collection("events").doc(apiEvent.id);
        batch.set(eventRef, newEvent, { merge: true });
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
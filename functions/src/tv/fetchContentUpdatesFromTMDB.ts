import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";

import {
  fetchContentUpdatesFromTMDB as sharedFetchContentUpdates,
} from "@shared/tv/functions";

// ---------------------------------------------------------------------------
// Scheduled Function
// ---------------------------------------------------------------------------

/**
 * Nightly cron job that:
 * 1. Refreshes all TV/movie content in Firestore with the latest TMDB data.
 * 2. Detects new movies in TMDB franchise collections and adds them to Firestore,
 *    inheriting `who` from the sibling movie already tracked.
 *
 * Runs at 00:00 America/New_York every day.
 */
export const fetchContentUpdatesFromTMDB = onSchedule(
  {
    schedule: "0 0 * * *",
    timeZone: "America/New_York",
    timeoutSeconds: 540,
    memory: "256MiB",
  },
  async () => {
    logger.log("fetchContentUpdatesFromTMDB: starting nightly refresh");

    const apiKey = process.env.TMDB_API_KEY;
    const tvCollection = process.env.TV_COLLECTION;

    if (!apiKey || !tvCollection) {
      logger.error("Required environment variables (TMDB_API_KEY, TV_COLLECTION) are missing.");
      return;
    }

    const db = getFirestore();
    
    // Fetch all docs to update
    const snapshot = await db.collection(tvCollection).get();
    const docsToUpdate = snapshot.docs.map(doc => doc.data());

    // Define the persistence layer for the backend
    const saveDoc = async (id: string, data: any) => {
      await db.collection(tvCollection).doc(id).set(data, { merge: false });
    };
    
    // Call the unified shared logic
    await sharedFetchContentUpdates(docsToUpdate, apiKey, saveDoc);
    
    logger.log("fetchContentUpdatesFromTMDB: nightly refresh complete");
  }
);

export default fetchContentUpdatesFromTMDB;

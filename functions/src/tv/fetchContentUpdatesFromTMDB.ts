import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineString, defineSecret } from "firebase-functions/params";

import {
  fetchContentUpdatesFromTMDB as sharedFetchContentUpdates,
} from "@shared/tv/functions";

// ---------------------------------------------------------------------------
// Scheduled Function
// ---------------------------------------------------------------------------

const TMDB_API_KEY = defineSecret("TMDB_API_KEY");
const TV_COLLECTION = defineString("TV_COLLECTION");

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
    secrets: [TMDB_API_KEY],
  },
  async () => {
    logger.log("fetchContentUpdatesFromTMDB: starting nightly refresh for %s", TV_COLLECTION.value());

    const db = getFirestore();
    
    // Fetch all docs to update
    const snapshot = await db.collection(TV_COLLECTION.value()).get();
    const docsToUpdate = snapshot.docs.map(doc => doc.data());

    // Define the persistence layer for the backend
    const saveDoc = async (id: string, data: any) => {
      await db.collection(TV_COLLECTION.value()).doc(id).set(data, { merge: false });
    };
    
    // Call the unified shared logic
    await sharedFetchContentUpdates(docsToUpdate, TMDB_API_KEY.value(), saveDoc);
    
    logger.log("fetchContentUpdatesFromTMDB: nightly refresh complete");
  }
);

export default fetchContentUpdatesFromTMDB;

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Schedule function to run every day at midnight EST
export const deletePastCountdowns = functions.pubsub
  .schedule("0 0 * * *")
  .timeZone("America/New_York")
  .onRun(async (context) => {
    const db = admin.firestore();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const countdownsRef = db.collection("countdowns");
      const querySnapshot = await countdownsRef.get();
      const batch = db.batch();
      let batchCount = 0;

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const isCustomId = data.isCustomId;

        if (!isCustomId) {
          // Parse the date from the document ID (MM-DD-YYYY)
          const [month, day, year] = doc.id.split("-").map(Number);
          const date = new Date(year, month - 1, day); // month is 0-based

          if (date < today) {
            batch.delete(doc.ref);
            batchCount++;

            // Firestore batches are limited to 500 operations
            if (batchCount >= 500) {
              await batch.commit();
              batchCount = 0;
            }
          }
        }
      }

      // Commit any remaining operations
      if (batchCount > 0) {
        await batch.commit();
      }

      console.log("Successfully deleted past countdowns");
      return null;
    } catch (error) {
      console.error("Error deleting past countdowns:", error);
      return null;
    }
  });
import { FB_COUNTDOWN_COLLECTION } from "@shared/countdown/constants.js";
import { FbEvent } from "@shared/countdown/types.js";
import { toDate } from "@shared/utils.js";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";

initializeApp();

export const deletePastEvents = onSchedule(
  {
    schedule: "0 0 * * *",
    timeZone: "America/New_York",
  },
  async () => {
    const db = getFirestore();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      // TODO move "countdowns" to lib to sync frontend and backend
      const countdownsRef = db.collection(FB_COUNTDOWN_COLLECTION);
      const querySnapshot = await countdownsRef.get();
      const batch = db.batch();
      let batchCount = 0;

      for (const doc of querySnapshot.docs) {
        const event = doc.data() as FbEvent;
        const date = toDate(event.date);

        if (date !== null && date < today) {
          batch.delete(doc.ref);
          batchCount++;

          if (batchCount >= 500) {
            await batch.commit();
            batchCount = 0;
          }
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }

      console.log("Successfully deleted past countdowns");
    } catch (error) {
      console.error("Error deleting past countdowns:", error);
    }
  }
);

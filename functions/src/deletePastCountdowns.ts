import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";

import { FbEvent } from "../../shared/types/countdown.js";
import { toDate } from "../../shared/utils.js";

initializeApp();

export const deletePastCountdowns = onSchedule(
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
      const countdownsRef = db.collection("countdowns");
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

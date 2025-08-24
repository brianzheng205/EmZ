import { FB_COUNTDOWN_COLLECTION } from "@shared/countdown/constants.js";
import { FbEvent } from "@shared/countdown/types.js";
import { RepeatFrequency } from "@shared/types.js";
import { addDays, addMonths, addWeeks, addYears } from "@shared/utils.js";
import { toDate } from "@shared/utils.js";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";

initializeApp();

export const updateFutureEvents = onSchedule(
  {
    schedule: "0 0 * * *",
    timeZone: "America/New_York",
  },
  async () => {
    const db = getFirestore();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const countdownsRef = db.collection(FB_COUNTDOWN_COLLECTION);
      const querySnapshot = await countdownsRef.get();
      const batch = db.batch();
      let batchCount = 0;

      for (const doc of querySnapshot.docs) {
        const event = doc.data() as FbEvent;
        const date = toDate(event.date);

        if (date !== null && date < today) {
          if (event.repeatFreq !== RepeatFrequency.Never) {
            let newDate: Date;

            switch (event.repeatFreq) {
              case RepeatFrequency.Daily:
                newDate = addDays(date, 1);
                break;
              case RepeatFrequency.Weekly:
                newDate = addWeeks(date, 1);
                break;
              case RepeatFrequency.Biweekly:
                newDate = addWeeks(date, 2);
                break;
              case RepeatFrequency.Monthly:
                newDate = addMonths(date, 1);
                break;
              case RepeatFrequency.Yearly:
                newDate = addYears(date, 1);
                break;
              default:
                throw new Error(
                  `Unsupported repeat frequency: ${event.repeatFreq}`
                );
            }

            batch.update(doc.ref, { date: newDate.toISOString() });
          } else {
            batch.delete(doc.ref);
          }

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

      console.log("Successfully updated future countdowns");
    } catch (error) {
      console.error("Error updating future countdowns:", error);
    }
  }
);

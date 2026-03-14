import { FB_COUNTDOWN_COLLECTION } from "@shared/countdown/constants";
import { FbEvent } from "@shared/countdown/types";
import { RepeatFrequency } from "@shared/types";
import { getNextDate } from "@shared/utils";
import { toDate } from "@shared/utils";
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";

/**
 * Determine what action to take for an event based on its date, today's date,
 * and repeat frequency.
 *
 * @param event - The event to evaluate
 * @param today - Today's date (with time set to 00:00:00)
 * @returns - If the event date is in the future or `null`, return `{ action: "keep" }`.
 * - If the event date is in the past and repeatFreq is Never, return `{ action: "delete" }`.
 * - If the event date is in the past and repeatFreq is not Never, return `{ action: "renew", newDate }`
 * @throws Error if repeatFreq is unsupported
 */
const getEventAction = (
  event: FbEvent,
  today: Date
):
  | { action: "renew"; newDate: string }
  | { action: "delete" }
  | { action: "keep" } => {
  const date = toDate(event.date);

  // doesn't expire yet
  if (date === null || date >= today) {
    return { action: "keep" };
  }

  // expired and won't repeat
  if (event.repeatFreq === RepeatFrequency.Never) {
    return { action: "delete" };
  }

  // expired and will repeat
  return {
    action: "renew",
    newDate: getNextDate(date, event.repeatFreq).toISOString().split("T")[0],
  };
};

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
        const updateResult = getEventAction(event, today);

        if (updateResult.action === "keep") {
          continue;
        }

        if (updateResult.action === "renew") {
          batch.update(doc.ref, { date: updateResult.newDate });
        } else if (updateResult.action === "delete") {
          batch.delete(doc.ref);
        }

        batchCount++;

        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }

      logger.log("Successfully updated future countdowns");
    } catch (error) {
      logger.error("Error updating future countdowns:", error);
    }
  }
);

export default updateFutureEvents;

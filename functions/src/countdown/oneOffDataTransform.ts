import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onCall } from "firebase-functions/v2/https";
import * as R from "ramda";

import { Budget, BudgetItemsNew } from "../../../app/finance/types";

/**
 * HTTP function to run a one-time database cleanup script.
 * Call this function manually via its URL.
 */
const oneOffDataTransform = onCall(async () => {
  try {
    const db = getFirestore();
    const collectionRef = db.collection("budgets");
    const snapshot = await collectionRef.get();
    const batch = db.batch();
    let count = 0;

    for (const doc of snapshot.docs) {
      const data = { ...doc.data() } as Budget;
      const newData: BudgetItemsNew[] = [];

      R.forEachObjIndexed((categoryItems, categoryName) => {
        R.forEachObjIndexed((item, itemName) => {
          newData.push({
            type:
              categoryName === "deductions"
                ? "Deductions"
                : categoryName === "expenses"
                ? "Expenses"
                : categoryName === "savings"
                ? "Retirement" // Assuming savings map to Retirement
                : "Earnings", // Default to Earnings for gross
            name: itemName as string,
            amount: item.amount,
            amountTimeSpan: item.time === "month" ? "Monthly" : "Yearly",
            repeatFreq: item.isRecurring ? "Monthly" : "Never",
          });
        }, categoryItems);
      }, data.categories);
      const newDocRef = db.collection("budgets-v2").doc(doc.id);
      batch.set(newDocRef, newData);

      count++;
    }

    if (count > 0) {
      await batch.commit();
    }

    logger.log(
      `One-time database cleanup successfully processed ${count} documents.`
    );
  } catch (error) {
    logger.error("One-time cleanup failed:", error);
  }
});

export default oneOffDataTransform;

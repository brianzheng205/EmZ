import { DocumentReference, updateDoc } from "firebase/firestore";

import { fetchData, fetchDocument } from "@/utils";

import { Budget } from "./utils";

export async function fetchActiveBudgets() {
  return await fetchData("activeBudgets", new Date().getFullYear().toString());
}

export async function fetchBudget(budgetReference: DocumentReference) {
  return await fetchDocument(budgetReference);
}

export async function updateBudget(
  docRef: DocumentReference,
  category: string,
  name: string,
  amount: number,
  time: "month" | "year"
) {
  await updateDoc(docRef, {
    [`${category}.items.${name}`]: {
      amount: amount,
      time: time,
    },
  });
}

export const updateBudgetInFirestore = async (
  budgetReference: DocumentReference,
  changes: Partial<Budget>
): Promise<void> => {
  try {
    await updateDoc(budgetReference, changes);
  } catch (error) {
    console.error("Error updating budget in Firestore:", error);
  }
};

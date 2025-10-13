import {
  DocumentReference,
  updateDoc,
  addDoc,
  collection,
  getDoc,
  deleteDoc,
  doc,
  writeBatch,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import * as R from "ramda";

import db from "@firebase";

import { Budget } from "./types";

export const BUDGETS_COLLECTION = "budgets-v2";

// BUDGETS

export const createBudget = async (name: string, budgetToCopy: Budget) => {
  try {
    const newBudgetRef = await addDoc(collection(db, "budgets"), {
      ...R.clone(budgetToCopy),
      name,
    });

    const newBudgetSnap = await getDoc(newBudgetRef);
    const newBudget = newBudgetSnap.data() as Budget;

    return { id: newBudgetRef.id, newBudget };
  } catch (error) {
    console.error("Error creating budget:", error);
    return null;
  }
};

export const deleteBudget = async (docRef: DocumentReference) => {
  try {
    return await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting budget:", error);
    return null;
  }
};

// BUDGET ITEMS

export const updateBudgetItem = async (
  budgetId: string,
  oldBudgetItem: Budget,
  newBudgetItem: Budget
) => {
  try {
    const budgetDocRef = doc(db, BUDGETS_COLLECTION, budgetId);
    const batch = writeBatch(db);

    batch.update(budgetDocRef, {
      budgetItems: arrayRemove(oldBudgetItem),
    });

    batch.update(budgetDocRef, {
      budgetItems: arrayUnion(newBudgetItem),
    });

    await batch.commit();
  } catch (error) {
    console.error(
      `Error updating ${oldBudgetItem} with ${newBudgetItem} in budget ${budgetId} `,
      error
    );
  }
};

export const deleteBudgetItem = async (
  budgetId: string,
  oldBudgetItem: Budget
) => {
  try {
    const budgetDocRef = doc(db, BUDGETS_COLLECTION, budgetId);
    await updateDoc(budgetDocRef, {
      budgetItems: arrayRemove(oldBudgetItem),
    });
  } catch (error) {
    console.error(
      `Error deleting ${oldBudgetItem} in budget ${budgetId} `,
      error
    );
  }
};

// ACTIVE BUDGETS

export const updateActiveBudget = async (
  user: "emily" | "brian",
  docRef: DocumentReference
) => {
  try {
    return await updateDoc(doc(db, `users/${user}`), {
      activeBudget: docRef,
    });
  } catch (error) {
    console.error("Error updating active budget:", error);
    return null;
  }
};

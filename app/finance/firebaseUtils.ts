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

import { FbBudget, FbBudgetItem } from "./types";

// BUDGETS

export const createBudget = async (name: string, budgetToCopy: FbBudget) => {
  try {
    const newBudgetRef = await addDoc(collection(db, "budgets"), {
      ...R.clone(budgetToCopy),
      name,
    });

    const newBudgetSnap = await getDoc(newBudgetRef);
    const newBudget = newBudgetSnap.data() as FbBudget;

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
  oldBudgetItem: FbBudgetItem,
  newBudgetItem: FbBudgetItem
) => {
  const financeCollectionName = process.env.NEXT_PUBLIC_FINANCE_COLLECTION;

  if (!financeCollectionName) {
    console.error(
      "NEXT_PUBLIC_FINANCE_COLLECTION environment variable is not set."
    );
    return;
  }

  try {
    const budgetDocRef = doc(db, financeCollectionName, budgetId);
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
  oldBudgetItem: FbBudget
) => {
  const financeCollectionName = process.env.NEXT_PUBLIC_FINANCE_COLLECTION;

  if (!financeCollectionName) {
    console.error(
      "NEXT_PUBLIC_FINANCE_COLLECTION environment variable is not set."
    );
    return;
  }

  try {
    const budgetDocRef = doc(db, financeCollectionName, budgetId);
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

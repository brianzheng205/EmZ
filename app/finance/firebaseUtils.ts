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

import db from "@firebase";

import { FbBudget, FbBudgetItem, FbBudgetMetadata } from "./types";

// BUDGETS

// TODO default to empty string to avoid undefined checks and only
// check for empty and console error during fetching
const financeCollectionName = process.env.NEXT_PUBLIC_FINANCE_COLLECTION;

export const createBudget = async (newBudget: FbBudget) => {
  if (!financeCollectionName) {
    console.error(
      "NEXT_PUBLIC_FINANCE_COLLECTION environment variable is not set."
    );
    return;
  }

  try {
    const newBudgetRef = await addDoc(
      collection(db, financeCollectionName),
      newBudget
    );
    const newBudgetSnap = await getDoc(newBudgetRef);
    const newBudgetData = newBudgetSnap.data() as FbBudget;
    return { id: newBudgetRef.id, newBudgetData };
  } catch (error) {
    console.error("Error creating budget:", error);
    return null;
  }
};

export const updateBudgetMetadata = async (
  budgetId: string,
  newMetadata: FbBudgetMetadata
) => {
  if (!financeCollectionName) {
    console.error(
      "NEXT_PUBLIC_FINANCE_COLLECTION environment variable is not set."
    );
    return;
  }

  try {
    const budgetDocRef = doc(db, financeCollectionName, budgetId);
    return await updateDoc(budgetDocRef, {
      name: newMetadata.name,
      numMonths: newMetadata.numMonths,
      user: newMetadata.user,
    });
  } catch (error) {
    console.error("Error updating budget metadata:", error);
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

export const createBudgetItem = async (
  budgetId: string,
  newBudgetItem: FbBudgetItem
) => {
  if (!financeCollectionName) {
    console.error(
      "NEXT_PUBLIC_FINANCE_COLLECTION environment variable is not set."
    );
    return;
  }

  try {
    const budgetDocRef = doc(db, financeCollectionName, budgetId);
    await updateDoc(budgetDocRef, {
      budgetItems: arrayUnion(newBudgetItem),
    });
  } catch (error) {
    console.error("Error creating budget item:", error);
  }
};

export const updateBudgetItem = async (
  budgetId: string,
  oldBudgetItem: FbBudgetItem,
  newBudgetItem: FbBudgetItem
) => {
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
  oldBudgetItem: FbBudgetItem
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

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

export const getFinanceCollectionName = (env: NodeJS.ProcessEnv) => {
  const isProductionOrMainPR =
    env.VERCEL_ENV === "production" ||
    env.VERCEL_GIT_PULL_REQUEST_TARGET === "main";

  return isProductionOrMainPR
    ? env.NEXT_PUBLIC_FINANCE_COLLECTION_PROD || "budgets"
    : env.NEXT_PUBLIC_FINANCE_COLLECTION_DEV || "budgets-dev";
};

export const FINANCE_COLLECTION_NAME = getFinanceCollectionName(process.env);

export const createBudget = async (newBudget: FbBudget) => {
  if (!FINANCE_COLLECTION_NAME) {
    console.error(
      "Finance collection name could not be determined.",
    );
    return;
  }

  try {
    const newBudgetRef = await addDoc(
      collection(db, FINANCE_COLLECTION_NAME),
      newBudget,
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
  newMetadata: FbBudgetMetadata,
) => {
  if (!FINANCE_COLLECTION_NAME) {
    console.error(
      "Finance collection name could not be determined.",
    );
    return;
  }

  try {
    const budgetDocRef = doc(db, FINANCE_COLLECTION_NAME, budgetId);
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
  newBudgetItem: FbBudgetItem,
) => {
  if (!FINANCE_COLLECTION_NAME) {
    console.error(
      "Finance collection name could not be determined.",
    );
    return;
  }

  try {
    const budgetDocRef = doc(db, FINANCE_COLLECTION_NAME, budgetId);
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
  newBudgetItem: FbBudgetItem,
) => {
  if (!FINANCE_COLLECTION_NAME) {
    console.error(
      "Finance collection name could not be determined.",
    );
    return;
  }

  try {
    const budgetDocRef = doc(db, FINANCE_COLLECTION_NAME, budgetId);
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
      error,
    );
  }
};

export const deleteBudgetItem = async (
  budgetId: string,
  oldBudgetItem: FbBudgetItem,
) => {
  if (!FINANCE_COLLECTION_NAME) {
    console.error(
      "Finance collection name could not be determined.",
    );
    return;
  }

  try {
    const budgetDocRef = doc(db, FINANCE_COLLECTION_NAME, budgetId);
    await updateDoc(budgetDocRef, {
      budgetItems: arrayRemove(oldBudgetItem),
    });
  } catch (error) {
    console.error(
      `Error deleting ${oldBudgetItem} in budget ${budgetId} `,
      error,
    );
  }
};

// ACTIVE BUDGETS

export const updateActiveBudget = async (
  user: "emily" | "brian",
  docRef: DocumentReference,
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

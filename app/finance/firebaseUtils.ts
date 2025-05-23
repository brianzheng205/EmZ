import {
  DocumentReference,
  updateDoc,
  deleteField,
  addDoc,
  collection,
  getDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import * as R from "ramda";

import { fetchData, fetchDocuments } from "@/utils";
import db from "@firebase";

import { IdToBudget, Budget } from "./types";

const pathToString = (path: string[]) => path.join(".");

export const fetchAllBudgets = async () => {
  try {
    const budgets = (await fetchDocuments("budgets")) as IdToBudget;
    const emilyBudgets: IdToBudget = {};
    const brianBudgets: IdToBudget = {};

    R.forEachObjIndexed((budget, budgetId) => {
      if (budget.user === "emily") {
        emilyBudgets[budgetId] = budget;
      } else if (budget.user === "brian") {
        brianBudgets[budgetId] = budget;
      }
    }, budgets);

    return {
      emily: emilyBudgets,
      brian: brianBudgets,
    };
  } catch (error) {
    console.error("Error fetching all budgets:", error);
    return null;
  }
};

export const fetchActiveBudgets = async () => {
  const [emilyBudget, brianBudget] = await Promise.all([
    fetchData("users/emily"),
    fetchData("users/brian"),
  ]);

  if (!emilyBudget || !brianBudget) {
    console.error("Failed to fetch active budgets for Emily or Brian.");
    return null;
  }

  return {
    emilyBudget: emilyBudget.activeBudget,
    brianBudget: brianBudget.activeBudget,
  };
};

export const updateBudget = async (
  docRef: DocumentReference,
  oldPath: string[],
  newPath: string[],
  object: object
) => {
  const newPathStr = pathToString(newPath);
  const oldPathStr = pathToString(oldPath);
  const updates =
    newPathStr === ""
      ? object
      : {
          [newPathStr]: object,
        };

  if (oldPathStr !== newPathStr && oldPathStr !== "")
    updates[oldPathStr] = deleteField();

  try {
    return await updateDoc(docRef, updates);
  } catch (error) {
    console.error("Error updating budget:", error);
    return null;
  }
};

export const deleteBudgetItem = async (
  docRef: DocumentReference,
  path: string[]
) => {
  const pathStr = pathToString(path);
  return await updateDoc(docRef, {
    [pathStr]: deleteField(),
  });
};

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

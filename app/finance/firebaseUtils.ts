import { DocumentReference, updateDoc, deleteField } from "firebase/firestore";

import { fetchData, fetchDocument } from "@/utils";

const pathToString = (path: string[]) => path.join(".");

export async function fetchActiveBudgets() {
  return await fetchData("activeBudgets", new Date().getFullYear().toString());
}

export async function fetchBudget(budgetReference: DocumentReference) {
  return await fetchDocument(budgetReference);
}

export const updateBudget = async (
  docRef: DocumentReference,
  oldPath: string[],
  newPath: string[],
  object: object
) => {
  const newPathStr = pathToString(newPath);
  const oldPathStr = pathToString(oldPath);

  const updates = {
    [newPathStr]: object,
  };

  if (oldPathStr !== newPathStr) updates[oldPathStr] = deleteField();

  return updateDoc(docRef, updates);
};

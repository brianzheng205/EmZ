import { DocumentReference, updateDoc, deleteField } from "firebase/firestore";

import { fetchData, fetchDocument } from "@/utils";

const pathToString = (path: string[]) => path.join(".");

export const fetchActiveBudgets = async () =>
  await fetchData("activeBudgets", new Date().getFullYear().toString());

export const fetchBudget = async (budgetReference: DocumentReference) =>
  await fetchDocument(budgetReference);

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

  if (oldPathStr !== newPathStr && oldPathStr !== "")
    updates[oldPathStr] = deleteField();

  return await updateDoc(docRef, updates);
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

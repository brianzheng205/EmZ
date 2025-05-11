import { DocumentReference, updateDoc, deleteField } from "firebase/firestore";

import { fetchData, fetchDocument } from "@/utils";

const pathToString = (path: string[]) => path.join(".");

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

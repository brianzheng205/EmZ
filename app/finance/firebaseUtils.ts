import { DocumentReference, updateDoc, deleteField } from "firebase/firestore";

import { fetchData, fetchDocument, fetchDocumentIds } from "@/utils";

import { BudgetWithId } from "./utils";

const pathToString = (path: string[]) => path.join(".");

export const fetchAllBudgets = async () => {
  try {
    const budgets = (await fetchDocumentIds("budgets")) as BudgetWithId[];
    const emilyBudgets: BudgetWithId[] = [];
    const brianBudgets: BudgetWithId[] = [];

    budgets.forEach((budget) => {
      if (budget.user === "emily") {
        emilyBudgets.push(budget);
      } else if (budget.user === "brian") {
        brianBudgets.push(budget);
      }
    });

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
  const updates =
    newPathStr === ""
      ? object
      : {
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

import {
  getFirestore,
  doc,
  getDoc,
  DocumentData,
  DocumentReference,
  updateDoc,
} from "firebase/firestore";

import { fetchData, fetchDocument } from "@/utils";
import app from "@firebase";

import { Budget } from "./utils";

const db = getFirestore(app);

export async function fetchActiveBudgets() {
  return await fetchData("activeBudgets", new Date().getFullYear().toString());
}

export async function fetchBudget(budgetReference: DocumentReference) {
  return await fetchDocument(budgetReference);
}

export const updateBudget = (
  path: string[],
  setBudget: React.Dispatch<React.SetStateAction<DocumentData>>
) => {
  if (path.length === 0) return;

  const docRef = doc(db, path.join("/"));
  getDoc(docRef).then((docSnap) => setBudget(docSnap.data() as DocumentData));
};

export const updateBudgetInFirestore = async (
  budgetReference: DocumentReference,
  changes: Partial<Budget>
): Promise<void> => {
  await updateDoc(budgetReference, changes);
};

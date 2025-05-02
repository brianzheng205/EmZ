import {
  getFirestore,
  doc,
  getDoc,
  DocumentData,
  DocumentReference,
} from "firebase/firestore";

import { fetchData, fetchDocument } from "@/utils";
import app from "@firebase";

const db = getFirestore(app);

export async function fetchActiveBudgets() {
  return fetchData("activeBudgets", new Date().getFullYear().toString());
}

export async function fetchBudget(budgetReference: DocumentReference) {
  return fetchDocument(budgetReference);
}

export const updateBudget = (
  path: string[],
  setBudget: React.Dispatch<React.SetStateAction<DocumentData>>
) => {
  if (path.length === 0) return;

  const docRef = doc(db, path.join("/"));
  getDoc(docRef).then((docSnap) => setBudget(docSnap.data() as DocumentData));
};

import {
  setDoc,
  getFirestore,
  doc,
  getDocs,
  collection,
  deleteDoc,
} from "firebase/firestore";

import app from "@firebase";

import { Content } from "./utils";

const db = getFirestore(app);

export function addContentToFirebase(content: Content) {
  return setDoc(doc(db, "tv", String(content.id)), content);
}

export async function fetchAllContentFromFirebase() {
  return await getDocs(collection(db, "tv"));
}

export async function deleteContentFromFirebase(id: number) {
  return await deleteDoc(doc(db, "tv", String(id)));
}

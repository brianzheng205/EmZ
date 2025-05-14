import {
  doc,
  getDoc,
  DocumentReference,
  getDocs,
  collection,
} from "firebase/firestore";
import * as R from "ramda";

import db from "@firebase";

// FIREBASE
export const fetchDocumentIds = async (collectionName: string) => {
  const collectionRef = collection(db, collectionName);
  const querySnapshot = await getDocs(collectionRef);
  return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};

export const fetchDocument = async (docRef: DocumentReference) => {
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.error("Document does not exist", docRef.path);
    return null;
  }
};

export const fetchData = async (path: string) => {
  const docRef = doc(db, path);
  return await fetchDocument(docRef);
};

// DATES
export const getAdjustedDate = (date: Date) => {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + timezoneOffset);
};

// STRINGS
export const capitalizeFirstLetter = (value: string) =>
  value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : "";

// CANVAS
export const resizeCanvas = (canvas: HTMLCanvasElement) => {
  const prevWidth = canvas.width;
  const prevHeight = canvas.height;

  const { width, height } = canvas.parentElement!.getBoundingClientRect();
  canvas.width = width;
  canvas.height = height;

  const scaleX = canvas.width / prevWidth || 1;
  const scaleY = canvas.height / prevHeight || 1;

  return { scaleX, scaleY };
};

// RAMDA
export const mapIndexed = R.addIndex(R.map);

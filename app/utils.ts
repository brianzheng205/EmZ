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
export const fetchDocuments = async (
  collectionName: string
): Promise<{ [id: string]: object }> => {
  const collectionRef = collection(db, collectionName);
  const querySnapshot = await getDocs(collectionRef);
  const docs = {};

  querySnapshot.docs.forEach((doc) => {
    docs[doc.id] = doc.data();
  });
  return docs;
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
// TODO remove by using toISODate rather than Date's toISOString
// Also centralize all date utils here
export const getAdjustedDate = (date: Date) => {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + timezoneOffset);
};

/**
 * Converts a Date object to a string in the format "YYYY-MM-DD".
 * Returns empty string if date is null.
 *
 * Differs from toISOString().slice(0, 10) by using local timezone rather than UTC.
 */
export const toLocalDateStr = (date: Date | null): string => {
  if (date === null) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Converts a dateStr in ISO format (YYYY-MM-DD) to a string in US format "MM/DD/YY".
 */
export const toUSDateStr = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${month}/${day}/${year % 100}`;
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

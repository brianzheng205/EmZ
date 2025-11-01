import {
  setDoc,
  doc,
  getDocs,
  collection,
  deleteDoc,
} from "firebase/firestore";

import db from "@firebase";

import { Content, Provider } from "./utils";

export function addContentToFirebase(content: Content) {
  // const cleanedContent: EmZContent = filterToInterface<EmZContent>(content, [
  //   "who",
  //   "watched",
  //   "episodes",
  //   "ongoing",
  //   "adult",
  //   "backdrop_path",
  //   "genre_ids",
  //   "id",
  //   "original_language",
  //   "overview",
  //   "popularity",
  //   "poster_path",
  //   "vote_average",
  //   "vote_count",
  //   "media_type",
  //   "origin_country",
  //   "original_name",
  //   "first_air_date",
  //   "name",
  //   "original_title",
  //   "release_date",
  //   "title",
  //   "video",
  // ]);
  const dbPath = process.env.NEXT_PUBLIC_TV_COLLECTION;
  if (!dbPath) {
    console.error("Firebase TV collection is not defined");
    return;
  }

  if (content.id) {
    return setDoc(doc(db, dbPath, String(content.id)), content);
  }
}

export async function fetchAllContentFromFirebase() {
  const dbPath = process.env.NEXT_PUBLIC_TV_COLLECTION;
  if (!dbPath) {
    console.error("Firebase TV collection is not defined");
    return;
  }
  return await getDocs(collection(db, dbPath));
}

export async function deleteContentFromFirebase(id: number) {
  const dbPath = process.env.NEXT_PUBLIC_TV_COLLECTION;
  if (!dbPath) {
    console.error("Firebase TV collection is not defined");
    return;
  }
  return await deleteDoc(doc(db, dbPath, String(id)));
}

export async function fetchAllProvidersFromFirebase() {
  const dbPath = process.env.NEXT_PUBLIC_TV_PROVIDERS_COLLECTION;
  if (!dbPath) {
    console.error("Firebase TV providers collection is not defined");
    return;
  }
  return await getDocs(collection(db, dbPath));
}

export async function addProviderToFirebase(provider: Provider) {
  const dbPath = process.env.NEXT_PUBLIC_TV_PROVIDERS_COLLECTION;
  if (!dbPath) {
    console.error("Firebase TV providers collection is not defined");
    return;
  }
  return setDoc(doc(db, dbPath, String(provider.provider_id)), provider);
}

export async function deleteProviderFromFirebase(id: number) {
  const dbPath = process.env.NEXT_PUBLIC_TV_PROVIDERS_COLLECTION;
  if (!dbPath) {
    console.error("Firebase TV providers collection is not defined");
    return;
  }
  return await deleteDoc(doc(db, dbPath, String(id)));
}

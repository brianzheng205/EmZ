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
  if (content.id) {
    return setDoc(doc(db, "tv-content", String(content.id)), content);
  }
}

export async function fetchAllContentFromFirebase() {
  return await getDocs(collection(db, "tv-content"));
}

export async function deleteContentFromFirebase(id: number) {
  return await deleteDoc(doc(db, "tv-content", String(id)));
}

export async function fetchAllProvidersFromFirebase() {
  return await getDocs(collection(db, "tv-providers"));
}

export async function addProviderToFirebase(provider: Provider) {
  return setDoc(
    doc(db, "tv-providers", String(provider.provider_id)),
    provider
  );
}

export async function deleteProviderFromFirebase(id: number) {
  return await deleteDoc(doc(db, "tv-providers", String(id)));
}

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
  return setDoc(doc(db, "tv", String(content.id)), content);
}

export async function fetchAllContentFromFirebase() {
  return await getDocs(collection(db, "tv"));
}

export async function deleteContentFromFirebase(id: number) {
  return await deleteDoc(doc(db, "tv", String(id)));
}

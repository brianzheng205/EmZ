import {
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  doc,
  DocumentReference,
} from "firebase/firestore";

import { fetchDocuments, fetchData } from "@/utils";
import db from "@firebase";

import {
  FirebaseScheduleItem,
  FirebaseMetadata,
  FirebaseDate,
  FirebaseIdToDate,
} from "./types";

export const fetchAllDates = async (): Promise<FirebaseIdToDate> => {
  try {
    const dates = await fetchDocuments("dates");
    return dates as FirebaseIdToDate;
  } catch (error) {
    console.error("Error fetching all dates:", error);
    return {} as FirebaseIdToDate;
  }
};

export const fetchActiveDateRef =
  async (): Promise<DocumentReference | null> => {
    try {
      const date = await fetchData("users/brian");

      if (!date) {
        console.error("Failed to fetch active dates for Emily or Brian.");
        return null;
      }

      return date.activeDate as DocumentReference | null;
    } catch (error) {
      console.error("Error fetching active date ID:", error);
      return null;
    }
  };

export const createDate = async (metadata: FirebaseMetadata) => {
  const newSchedule: FirebaseScheduleItem[] = [
    {
      startTime: "10:00",
      duration: 0,
      activity: "Get Ready",
      activtyType: "Prepare",
      notes: "",
      startTimeFixed: true,
    },
  ];

  try {
    const newDateData: FirebaseDate = {
      ...metadata,
      schedule: newSchedule,
    };

    const newDateRef = await addDoc(collection(db, "dates"), newDateData);
    const newDateSnap = await getDoc(newDateRef);
    const newDate = newDateSnap.data() as FirebaseDate;
    return { id: newDateRef.id, newDate };
  } catch (error) {
    console.error("Error creating new date:", error);
    return null;
  }
};

export const updateActiveDate = async (
  dateRef: DocumentReference
): Promise<void> => {
  try {
    await updateDoc(doc(db, "users/brian"), { activeDate: dateRef });
  } catch (error) {
    console.error("Error updating active date:", error);
  }
};

export const updateDateMetadata = async (
  id: string,
  metadata: FirebaseMetadata
): Promise<void> => {
  const dateRef = doc(db, "dates", id);

  try {
    await updateDoc(dateRef, metadata);
  } catch (error) {
    console.error("Error updating date metadata:", error);
  }
};

export const updateDateSchedule = async (
  dateRef: DocumentReference,
  schedule: FirebaseScheduleItem[]
) => {
  try {
    await updateDoc(dateRef, { schedule });
  } catch (error) {
    console.error("Error updating date schedule:", error);
  }
};

export const deleteDate = async (dateRef: DocumentReference) => {
  try {
    return await deleteDoc(dateRef);
  } catch (error) {
    console.error("Error deleting date:", error);
  }
};

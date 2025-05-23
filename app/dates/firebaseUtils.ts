import {
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  doc,
  DocumentReference,
} from "firebase/firestore";
import * as R from "ramda";

import { fetchDocuments, fetchData } from "@/utils";
import db from "@firebase";

import {
  FirestoreScheduleItem,
  FirestoreMetadata,
  FirestoreDate,
  FirestoreIdToDate,
  ScheduleItem,
  Metadata,
  EmZDate,
  IdToDate,
} from "./types";
import {
  convertDateStrToDate,
  convertTimeStrToDate,
  convertDateToDateStr,
  convertDateToTimeStr,
} from "./utils";

const convertToMetadata = (metadata: FirestoreMetadata): Metadata => ({
  ...metadata,
  date: convertDateStrToDate(metadata.date),
});

const convertToFirestoreMetadata = (metadata: Metadata): FirestoreMetadata => ({
  ...metadata,
  date: convertDateToDateStr(metadata.date),
});

const convertToSchedule = (schedule: FirestoreScheduleItem[]): ScheduleItem[] =>
  schedule.map((s) => ({ ...s, startTime: convertTimeStrToDate(s.startTime) }));

const convertToFirestoreSchedule = (
  schedule: ScheduleItem[]
): FirestoreScheduleItem[] =>
  schedule.map((s) => ({ ...s, startTime: convertDateToTimeStr(s.startTime) }));

const convertToEmZDate = (date: FirestoreDate): EmZDate => ({
  ...convertToMetadata(date),
  schedule: convertToSchedule(date.schedule),
});

export const fetchAllDates = async (): Promise<IdToDate> => {
  try {
    const dates = (await fetchDocuments("dates")) as FirestoreIdToDate;
    const datesConverted: IdToDate = R.mapObjIndexed(
      (d) => convertToEmZDate(d),
      dates
    );
    return datesConverted;
  } catch (error) {
    console.error("Error fetching all dates:", error);
    return {} as IdToDate;
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

export const createDate = async (
  metadata: Metadata
): Promise<[dateRef: DocumentReference, date: EmZDate] | null> => {
  const newSchedule: FirestoreScheduleItem[] = [
    {
      startTime: "10:00",
      duration: 0,
      activity: "Get Ready",
      activityType: "Prepare",
      notes: "",
      startTimeFixed: true,
    },
  ];

  try {
    const newDateData: FirestoreDate = {
      ...convertToFirestoreMetadata(metadata),
      schedule: newSchedule,
    };

    const newDateRef = await addDoc(collection(db, "dates"), newDateData);
    const newDateSnap = await getDoc(newDateRef);
    const newDate = newDateSnap.data() as FirestoreDate;
    const newDateConverted = convertToEmZDate(newDate);
    return [newDateRef, newDateConverted];
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
  metadata: Metadata
): Promise<void> => {
  const dateRef = doc(db, "dates", id);

  try {
    await updateDoc(dateRef, convertToFirestoreMetadata(metadata));
  } catch (error) {
    console.error("Error updating date metadata:", error);
  }
};

export const updateDateSchedule = async (
  dateRef: DocumentReference,
  schedule: ScheduleItem[]
) => {
  try {
    await updateDoc(dateRef, {
      schedule: convertToFirestoreSchedule(schedule.slice(0, -1)),
    });
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

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
  FirestorePlannerItem,
  FirestorePlannerMetadata,
  FirestoreDate,
  FirestoreIdToPlannerDate,
  PlannerItem,
  PlannerMetadata,
  PlannerDate,
  IdToPlannerDate,
  FirestoreListItem,
  FirestoreIdToListItem,
  ListRow,
} from "./types";
import {
  convertDateStrToDate,
  convertTimeStrToDate,
  convertDateToDateStr,
  convertDateToTimeStr,
} from "./utils";

// DATE PLANNER

const convertToMetadata = (
  metadata: FirestorePlannerMetadata
): PlannerMetadata => ({
  ...metadata,
  date: convertDateStrToDate(metadata.date),
});

const convertToFirestoreMetadata = (
  metadata: PlannerMetadata
): FirestorePlannerMetadata => ({
  ...metadata,
  date: convertDateToDateStr(metadata.date),
});

const convertToSchedule = (schedule: FirestorePlannerItem[]): PlannerItem[] =>
  schedule.map((s) => ({ ...s, startTime: convertTimeStrToDate(s.startTime) }));

const convertToFirestoreSchedule = (
  schedule: PlannerItem[]
): FirestorePlannerItem[] =>
  schedule.map((s) => ({ ...s, startTime: convertDateToTimeStr(s.startTime) }));

const convertToPlannerDate = (date: FirestoreDate): PlannerDate => ({
  ...convertToMetadata(date),
  schedule: convertToSchedule(date.schedule),
});

export const fetchAllDates = async (): Promise<IdToPlannerDate> => {
  try {
    const dates = (await fetchDocuments("dates")) as FirestoreIdToPlannerDate;
    const datesConverted: IdToPlannerDate = R.mapObjIndexed(
      (d) => convertToPlannerDate(d),
      dates
    );
    return datesConverted;
  } catch (error) {
    console.error("Error fetching all dates:", error);
    return {} as IdToPlannerDate;
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
  metadata: PlannerMetadata
): Promise<[dateRef: DocumentReference, date: PlannerDate] | null> => {
  const newSchedule: FirestorePlannerItem[] = [
    {
      startTime: "10:00",
      duration: 0,
      placeId: "",
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
    const newDateConverted = convertToPlannerDate(newDate);
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
  metadata: PlannerMetadata
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
  schedule: PlannerItem[]
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

// DATE SCHEDULE

export const fetchDateList = async (): Promise<ListRow[]> => {
  try {
    const idToListItem = (await fetchDocuments(
      "datesList"
    )) as FirestoreIdToListItem;
    const list: ListRow[] = [];

    R.forEachObjIndexed((item, id) => {
      list.push({ ...item, id });
    }, idToListItem);

    return list;
  } catch (error) {
    console.error("Error fetching date list:", error);
    return [];
  }
};

export const createDateListItem = async (
  item: FirestoreListItem
): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, "datesList"), item);
    return docRef.id;
  } catch (error) {
    console.error("Error creating date list item:", error);
    return null;
  }
};

export const updateDateListItem = async (itemRow: ListRow): Promise<void> => {
  const { id, ...item } = itemRow;
  const listItemRef = doc(db, "datesList", id);

  try {
    await updateDoc(listItemRef, item);
  } catch (error) {
    console.error("Error updating date list item:", error);
  }
};

export const deleteDateListItem = async (id: string): Promise<void> => {
  const listItemRef = doc(db, "datesList", id);

  try {
    await deleteDoc(listItemRef);
  } catch (error) {
    console.error("Error deleting date list item:", error);
  }
};

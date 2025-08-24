import { FB_COUNTDOWN_COLLECTION } from "@shared/countdown/constants";
import { RepeatFrequency } from "@shared/countdown/types";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import * as R from "ramda";

import db from "@firebase";

import { EventGroupsUpdaterFn } from "./types";

export const EVENTS_REF = collection(db, FB_COUNTDOWN_COLLECTION);

const backendUpdates = {
  /**
   *
   * @param date in YYYY-MM-DD format
   * @param description
   * @returns The id of the newly created document
   */
  async addEvent(
    date: string,
    repeatFreq: RepeatFrequency,
    description: string
  ): Promise<string> {
    const newEvent = {
      date,
      repeatFreq,
      description,
    };
    const docRef = await addDoc(EVENTS_REF, newEvent);
    return docRef.id;
  },

  /**
   *
   * @param id
   * @param date in YYYY-MM-DD format
   * @param description
   */
  async updateEvent(
    id: string,
    date: string,
    repeatFreq: RepeatFrequency,
    description: string
  ) {
    const docRef = doc(db, FB_COUNTDOWN_COLLECTION, id);
    await updateDoc(docRef, { date, repeatFreq, description });
  },

  async deleteEvent(id: string) {
    const docRef = doc(db, FB_COUNTDOWN_COLLECTION, id);
    await deleteDoc(docRef);
  },
};

const frontendUpdates = {
  /**
   *
   * @param id
   * @param date in YYYY-MM-DD format
   * @param description
   * @returns
   */
  addEvent:
    (
      id: string,
      date: string,
      repeatFreq: RepeatFrequency,
      description: string
    ): EventGroupsUpdaterFn =>
    (prevEventGroups) =>
      [{ id, date, repeatFreq, description }, ...R.clone(prevEventGroups)],

  /**
   *
   * @param id
   * @param date in YYYY-MM-DD format
   * @param description
   * @returns
   */
  updateEvent:
    (
      id: string,
      date: string,
      repeatFreq: RepeatFrequency,
      description: string
    ): EventGroupsUpdaterFn =>
    (prevEventGroups) =>
      prevEventGroups.map((event) =>
        event.id === id ? { ...event, date, repeatFreq, description } : event
      ),

  deleteEvent:
    (id: string): EventGroupsUpdaterFn =>
    (prevEventGroups) =>
      prevEventGroups.filter((event) => event.id !== id),
};

/**
 * `date` needs to be in YYYY-MM-DD format. Returns a state updater function.
 */
export const addEvent = async (
  date: string,
  repeatFreq: RepeatFrequency,
  description: string
): Promise<EventGroupsUpdaterFn> => {
  try {
    const id = await backendUpdates.addEvent(date, repeatFreq, description);
    return frontendUpdates.addEvent(id, date, repeatFreq, description);
  } catch (error) {
    console.error(`Error adding event with date ${date}:`, error);
    return (prevEventGroups) => prevEventGroups;
  }
};

/**
 * `date` needs to be in YYYY-MM-DD format. Returns a state updater function.
 */
export const updateEvent = async (
  id: string,
  date: string,
  repeatFreq: RepeatFrequency,
  description: string
): Promise<EventGroupsUpdaterFn> => {
  try {
    await backendUpdates.updateEvent(id, date, repeatFreq, description);
    return frontendUpdates.updateEvent(id, date, repeatFreq, description);
  } catch (error) {
    console.error(`Error updating event ${id}:`, error);
    return (prevEventGroups) => prevEventGroups;
  }
};

/**
 * Returns a state updater function
 */
export const deleteEvent = async (
  id: string
): Promise<EventGroupsUpdaterFn> => {
  try {
    await backendUpdates.deleteEvent(id);
    return frontendUpdates.deleteEvent(id);
  } catch (error) {
    console.error(`Error updating event ${id}:`, error);
    return (prevEventGroups) => prevEventGroups;
  }
};

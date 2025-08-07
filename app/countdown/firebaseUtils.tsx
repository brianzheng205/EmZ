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

const DB_NAME = "countdowns";
export const EVENTS_REF = collection(db, DB_NAME);

const backendUpdates = {
  /**
   *
   * @param date in YYYY-MM-DD format
   * @param description
   * @returns The id of the newly created document
   */
  async addEvent(date: string, description: string): Promise<string> {
    const newEvent = {
      date,
      description,
    };
    const docRef = await addDoc(EVENTS_REF, newEvent);
    return docRef.id;
  },

  /**
   *
   * @param id
   * @param newDate in YYYY-MM-DD format
   * @param newDescription
   */
  async updateEvent(id: string, newDate: string, newDescription: string) {
    const docRef = doc(db, DB_NAME, id);
    await updateDoc(docRef, { date: newDate, description: newDescription });
  },

  async deleteEvent(id: string) {
    const docRef = doc(db, DB_NAME, id);
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
    (id: string, date: string, description: string): EventGroupsUpdaterFn =>
    (prevEventGroups) =>
      [{ id, date, description }, ...R.clone(prevEventGroups)],

  /**
   *
   * @param id
   * @param newDate in YYYY-MM-DD format
   * @param newDescription
   * @returns
   */
  updateEvent:
    (
      id: string,
      newDate: string,
      newDescription: string
    ): EventGroupsUpdaterFn =>
    (prevEventGroups) =>
      prevEventGroups.map((event) =>
        event.id === id
          ? { ...event, date: newDate, description: newDescription }
          : event
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
  description: string
): Promise<EventGroupsUpdaterFn> => {
  try {
    const id = await backendUpdates.addEvent(date, description);
    return frontendUpdates.addEvent(id, date, description);
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
  description: string
): Promise<EventGroupsUpdaterFn> => {
  try {
    await backendUpdates.updateEvent(id, date, description);
    return frontendUpdates.updateEvent(id, date, description);
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

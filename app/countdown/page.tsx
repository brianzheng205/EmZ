"use client";

import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import app from "../../firebase/client";

import { useState, useEffect } from "react";
import { FaPencilAlt, FaTimes, FaCopy } from "react-icons/fa";

import AddCountdownForm from "./AddCountdownForm";
import EditCountdownForm from "./EditCountdownForm";

import { CountdownEvent, AddEventFn, EditEventFn } from "./types";
import { getAdjustedDate } from "../utils";

import "../globals.css";

const db = getFirestore(app);

const getDateString = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
};

export default function Countdown() {
  const [events, setEvents] = useState<CountdownEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<{
    dateId: string;
    description: string;
  } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const eventsRef = collection(db, "countdowns");
    const querySnapshot = await getDocs(eventsRef);

    const fetchedEvents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      descriptions: doc.data().descriptions || [],
    }));

    // Sort events by date ID
    fetchedEvents.sort((a, b) => {
      // Try to parse both IDs as dates (MM-DD-YYYY)
      const [monthA, dayA, yearA] = a.id.split("-").map(Number);
      const [monthB, dayB, yearB] = b.id.split("-").map(Number);

      // Check if both IDs are valid dates
      const isDateA = !isNaN(monthA) && !isNaN(dayA) && !isNaN(yearA);
      const isDateB = !isNaN(monthB) && !isNaN(dayB) && !isNaN(yearB);

      // If both are dates, compare them
      if (isDateA && isDateB) {
        // Compare years first
        if (yearA !== yearB) return yearA - yearB;
        // Then months
        if (monthA !== monthB) return monthA - monthB;
        // Then days
        return dayA - dayB;
      }

      // If only one is a date, put the non-date at the end
      if (isDateA) return -1;
      if (isDateB) return 1;

      // If neither is a date, maintain their relative order
      return a.id.localeCompare(b.id);
    });

    setEvents(fetchedEvents);
  };

  const addEvent: AddEventFn = async (newDate, newDescription) => {
    const date = new Date(newDate);
    const adjustedDate = getAdjustedDate(date);
    const dateId = getDateString(adjustedDate);
    const docRef = doc(db, "countdowns", dateId);

    // Check if document exists
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Add description to existing date
      await updateDoc(docRef, {
        descriptions: arrayUnion(newDescription),
      });
    } else {
      // Create new document for this date
      await setDoc(docRef, {
        descriptions: [newDescription],
      });
    }

    fetchEvents();
  };

  const editEvent: EditEventFn = async (
    oldDateId,
    oldDescription,
    newDate,
    newDescription
  ) => {
    // Remove from old date
    const oldDocRef = doc(db, "countdowns", oldDateId);
    const oldDocSnap = await getDoc(oldDocRef);

    if (oldDocSnap.exists()) {
      const descriptions = oldDocSnap.data().descriptions;
      if (descriptions.length === 1) {
        // If this was the only description, delete the document
        await deleteDoc(oldDocRef);
      } else {
        // Remove the old description
        await updateDoc(oldDocRef, {
          descriptions: arrayRemove(oldDescription),
        });
      }
    }

    // Add to new date
    const date = new Date(newDate);
    const adjustedDate = getAdjustedDate(date);
    const newDateId = getDateString(adjustedDate);
    const newDocRef = doc(db, "countdowns", newDateId);

    const newDocSnap = await getDoc(newDocRef);
    if (newDocSnap.exists()) {
      // Add description to existing date
      await updateDoc(newDocRef, {
        descriptions: arrayUnion(newDescription),
      });
    } else {
      // Create new document for this date
      await setDoc(newDocRef, {
        descriptions: [newDescription],
      });
    }

    fetchEvents();
  };

  const deleteEvent = async (dateId: string, description: string) => {
    try {
      const docRef = doc(db, "countdowns", dateId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentDescriptions = docSnap.data().descriptions;

        if (currentDescriptions.length === 1) {
          // If this is the last description, delete the whole document
          await deleteDoc(docRef);
        } else {
          // Remove just this description
          await updateDoc(docRef, {
            descriptions: arrayRemove(description),
          });
        }

        fetchEvents();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const formatCountdown = (dateId: string) => {
    // Parse the date from ID (MM-DD-YYYY)
    const [month, day, year] = dateId.split("-").map(Number);
    const date = new Date(year, month - 1, day); // month is 0-based

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate days difference
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "TODAY";
    if (diffDays < 0) return "PAST";
    return `D-${diffDays}`;
  };

  const formatMarkdown = (events: CountdownEvent[]) => {
    return events
      .map((event) => {
        const countdown = formatCountdown(event.id);
        return `# **${countdown}**\n${event.descriptions
          .map((desc) => `- ${desc}`)
          .join("\n")}`;
      })
      .join("\n");
  };

  const copyToClipboard = async () => {
    const markdown = formatMarkdown(events);
    try {
      await navigator.clipboard.writeText(markdown);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex gap-8 p-4">
      <div className="w-1/2 space-y-4">
        <AddCountdownForm onAdd={addEvent} />
      </div>
      <div className="w-1/2 space-y-4">
        <div className="flex flex-col gap-4 h-[750px] overflow-y-auto border border-primary rounded-md p-2">
          {events.map((event) => (
            <div key={event.id} className="bg-accent rounded-2xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {formatCountdown(event.id)}
                </h2>
                <span className="text-sm text-gray-500">
                  {event.id.replace(/-/g, "/")}
                </span>
              </div>
              <div className="space-y-3">
                {event.descriptions.map((description, index) => (
                  <div
                    key={`${event.id}-${index}`}
                    className="flex justify-between items-start border-b border-primary/20 pb-3 last:border-0"
                  >
                    {editingEvent?.dateId === event.id &&
                    editingEvent?.description === description ? (
                      <EditCountdownForm
                        dateId={event.id}
                        description={description}
                        onEdit={editEvent}
                        onCancel={() => setEditingEvent(null)}
                      />
                    ) : (
                      <>
                        <p>{description}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              setEditingEvent({ dateId: event.id, description })
                            }
                            className="text-primary hover:text-secondary"
                          >
                            <FaPencilAlt className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteEvent(event.id, description)}
                            className="text-primary hover:text-secondary"
                          >
                            <FaTimes className="h-5 w-5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={copyToClipboard}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white p-2 rounded-md hover:bg-secondary transition-colors"
        >
          <FaCopy className="h-4 w-4" />
          {copySuccess ? "Copied!" : "Copy as Markdown"}
        </button>
      </div>
    </div>
  );
}

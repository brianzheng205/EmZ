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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fetchedEvents: CountdownEvent[] = [];
    const deletePromises: Promise<void>[] = [];

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const isCustomId = data.isCustomId;

      if (!isCustomId) {
        // Handle date-based countdowns
        const [month, day, year] = doc.id.split("-").map(Number);
        const date = new Date(year, month - 1, day); // month is 0-based

        if (date < today) {
          // Delete past events
          deletePromises.push(deleteDoc(doc.ref));
          return;
        }
      }

      fetchedEvents.push({
        id: doc.id,
        descriptions: data.descriptions || [],
        isCustomId: data.isCustomId,
      });
    });

    // Wait for all deletions to complete
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }

    // Sort events: custom IDs first, then dates
    fetchedEvents.sort((a, b) => {
      // Custom IDs go last
      if (a.isCustomId && !b.isCustomId) return 1;
      if (!a.isCustomId && b.isCustomId) return -1;

      // If both are custom IDs, sort alphabetically
      if (a.isCustomId && b.isCustomId) {
        return a.id.localeCompare(b.id);
      }

      // If both are dates, sort chronologically
      const [monthA, dayA, yearA] = a.id.split("-").map(Number);
      const [monthB, dayB, yearB] = b.id.split("-").map(Number);

      // Compare years first
      if (yearA !== yearB) return yearA - yearB;
      // Then months
      if (monthA !== monthB) return monthA - monthB;
      // Then days
      return dayA - dayB;
    });

    setEvents(fetchedEvents);
  };

  const addEvent: AddEventFn = async (id, description, isCustomId = false) => {
    if (!isCustomId) {
      const date = new Date(id);
      const adjustedDate = getAdjustedDate(date);
      id = getDateString(adjustedDate);
    }

    const docRef = doc(db, "countdowns", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Add description to existing date/id
      await updateDoc(docRef, {
        descriptions: arrayUnion(description),
        isCustomId,
      });
    } else {
      // Create new document
      await setDoc(docRef, {
        descriptions: [description],
        isCustomId,
      });
    }

    fetchEvents();
  };

  const editEvent: EditEventFn = async (
    oldId,
    oldDescription,
    newId,
    newDescription,
    isCustomId = false
  ) => {
    // Remove from old ID
    const oldDocRef = doc(db, "countdowns", oldId);
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

    // Format new ID if it's a date
    if (!isCustomId) {
      const date = new Date(newId);
      const adjustedDate = getAdjustedDate(date);
      newId = getDateString(adjustedDate);
    }

    // Add to new ID
    const newDocRef = doc(db, "countdowns", newId);
    const newDocSnap = await getDoc(newDocRef);

    if (newDocSnap.exists()) {
      // Add description to existing date/id
      await updateDoc(newDocRef, {
        descriptions: arrayUnion(newDescription),
        isCustomId,
      });
    } else {
      // Create new document
      await setDoc(newDocRef, {
        descriptions: [newDescription],
        isCustomId,
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

  const formatCountdown = (id: string, isCustomId?: boolean) => {
    if (isCustomId) return id;

    // Parse the date from ID (MM-DD-YYYY)
    const [month, day, year] = id.split("-").map(Number);
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

  const getExistingCustomIds = () => {
    return events.filter((event) => event.isCustomId).map((event) => event.id);
  };

  const formatMarkdown = (events: CountdownEvent[]) => {
    return events
      .map((event) => {
        const countdown = formatCountdown(event.id, event.isCustomId);
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
        <AddCountdownForm
          onAdd={addEvent}
          existingCustomIds={getExistingCustomIds()}
        />
      </div>
      <div className="w-1/2 space-y-4">
        <div className="flex flex-col gap-4 h-[750px] overflow-y-auto border border-primary rounded-md p-2">
          {events.map((event) => (
            <div key={event.id} className="bg-accent rounded-2xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {formatCountdown(event.id, event.isCustomId)}
                </h2>
                <span className="text-sm text-gray-500">
                  {event.isCustomId ? event.id : event.id.replace(/-/g, "/")}
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
                        existingCustomIds={getExistingCustomIds()}
                        isCustomId={event.isCustomId}
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

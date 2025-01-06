"use client";

import { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import app from "../../firebase/client";

import "../globals.css";

type CountdownEvent = {
  id: string;
  date: Date;
  description: string;
};

const db = getFirestore(app);

export default function Countdown() {
  const [events, setEvents] = useState<CountdownEvent[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const eventsRef = collection(db, "countdowns");
    const q = query(eventsRef, orderBy("date", "asc"));
    const querySnapshot = await getDocs(q);

    const fetchedEvents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      date: doc.data().date.toDate(),
      description: doc.data().description,
    }));

    setEvents(fetchedEvents);
  };

  const addEvent = async () => {
    try {
      const date = new Date(newDate);
      const timezoneOffset = date.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(date.getTime() + timezoneOffset);
      console.log(date, timezoneOffset, adjustedDate);

      await addDoc(collection(db, "countdowns"), {
        date: Timestamp.fromDate(adjustedDate),
        description: newDescription,
      });

      setNewDate("");
      setNewDescription("");
      fetchEvents();
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, "countdowns", id));
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const formatCountdown = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.setHours(0, 0, 0, 0);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays < 0) return "PAST";
    if (diffDays === 0) return "TODAY";
    return `D-${diffDays}`;
  };

  return (
    <div className="flex gap-8 p-4">
      <div className="w-1/2 space-y-4">
        <div className="bg-accent rounded-md p-4 space-y-4">
          <h2 className="text-xl font-bold mb-4">Add New Countdown</h2>
          <div className="space-y-2">
            <label className="block">Date:</label>
            <input
              type="date"
              className="w-full p-2 rounded border border-primary"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block">Description:</label>
            <input
              type="text"
              className="w-full p-2 rounded border border-primary"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Enter event description"
            />
          </div>
          <button
            className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-secondary"
            onClick={addEvent}
          >
            Add Countdown
          </button>
        </div>
      </div>
      <div className="w-1/2 space-y-4">
        <div className="flex flex-col gap-4 h-[750px] overflow-y-auto border border-primary rounded-md p-2">
          {events.map((event) => (
            <div key={event.id} className="bg-accent rounded-2xl p-4">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold mb-2">
                  {formatCountdown(event.date)}
                </h2>
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
              <p>{event.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                {event.date.toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

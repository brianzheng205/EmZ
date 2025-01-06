"use client";

import { useState } from "react";
import { AddEventFn } from "./types";

export default function AddCountdownForm(props: { onAdd: AddEventFn }) {
  const [newDate, setNewDate] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleSubmit = async () => {
    try {
      await props.onAdd(newDate, newDescription);
      setNewDate("");
      setNewDescription("");
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  return (
    <div className="bg-accent rounded-md p-4 space-y-4">
      <h2 className="text-xl font-bold mb-4 text-center">Add New Countdown</h2>
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
          placeholder='e.g. 4-year "ILY" anniversary. ❤️'
        />
      </div>
      <button
        className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-secondary"
        onClick={handleSubmit}
      >
        Add Countdown
      </button>
    </div>
  );
}

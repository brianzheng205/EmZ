"use client";

import { useState } from "react";

import CountdownFormInputs from "./CountdownFormInputs";

import { AddEventFn } from "./types";
import { getAdjustedDate } from "../utils";

interface AddCountdownFormProps {
  onAdd: AddEventFn;
}

export default function AddCountdownForm(props: AddCountdownFormProps) {
  const [newDate, setNewDate] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newDescription.trim()) {
      return;
    }

    // Additional check to prevent past dates
    const selectedDate = getAdjustedDate(new Date(newDate));
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return;
    }

    try {
      await props.onAdd(newDate, newDescription.trim());
      setNewDate("");
      setNewDescription("");
    } catch (error) {
      console.error("Error adding countdown:", error);
    }
  };

  return (
    <div className="bg-accent rounded-md p-4 space-y-4">
      <h2 className="text-xl font-bold mb-4 text-center">Add New Countdown</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <CountdownFormInputs
          date={newDate}
          description={newDescription}
          onDateChange={setNewDate}
          onDescriptionChange={setNewDescription}
          minDate={minDate}
        />
        <button
          type="submit"
          className="w-full bg-primary text-white p-2 rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!newDate || !newDescription.trim()}
        >
          Add Countdown
        </button>
      </form>
    </div>
  );
}

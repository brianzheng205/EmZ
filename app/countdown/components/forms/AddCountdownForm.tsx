"use client";

import { useState } from "react";

import CountdownFormInputs from "./CountdownFormInputs";

import { AddEventFn } from "../../types";
import { getAdjustedDate } from "../../../utils";

interface AddCountdownFormProps {
  onAdd: AddEventFn;
  existingCustomIds: string[];
}

export default function AddCountdownForm({
  onAdd,
  existingCustomIds,
}: AddCountdownFormProps) {
  const [newId, setNewId] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isCustomId, setIsCustomId] = useState(false);

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newDescription.trim()) {
      return;
    }

    if (!isCustomId) {
      // Additional check to prevent past dates
      const selectedDate = getAdjustedDate(new Date(newId));
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        return;
      }
    }

    try {
      await onAdd(newId, newDescription.trim(), isCustomId);
      setNewId("");
      setNewDescription("");
      setIsCustomId(false);
    } catch (error) {
      console.error("Error adding countdown:", error);
    }
  };

  return (
    <div className="bg-accent rounded-md p-4 space-y-4">
      <h2 className="text-xl font-bold mb-4 text-center">Add New Countdown</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <CountdownFormInputs
          id={newId}
          description={newDescription}
          onIdChange={(id, isCustom) => {
            setNewId(id);
            setIsCustomId(isCustom);
          }}
          onDescriptionChange={setNewDescription}
          minDate={minDate}
          existingCustomIds={existingCustomIds}
          isCustomId={isCustomId}
        />
        <button
          type="submit"
          className="w-full bg-primary text-white p-2 rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!newId || !newDescription.trim()}
        >
          Add Countdown
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";

import CountdownFormInputs from "./CountdownFormInputs";

import { EditEventFn } from "./types";
import { getAdjustedDate } from "../utils";

interface EditCountdownFormProps {
  dateId: string;
  description: string;
  onEdit: EditEventFn;
  onCancel: () => void;
}

export default function EditCountdownForm({
  dateId,
  description,
  onEdit,
  onCancel,
}: EditCountdownFormProps) {
  // Convert MM-DD-YYYY to YYYY-MM-DD for date input
  const [month, day, year] = dateId.split("-");
  const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
    2,
    "0"
  )}`;

  const [newDate, setNewDate] = useState(formattedDate);
  const [newDescription, setNewDescription] = useState(description);

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
      await onEdit(dateId, description, newDate, newDescription.trim());
      onCancel();
    } catch (error) {
      console.error("Error editing countdown:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CountdownFormInputs
        date={newDate}
        description={newDescription}
        onDateChange={setNewDate}
        onDescriptionChange={setNewDescription}
        minDate={minDate}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-primary text-white p-2 rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!newDate || !newDescription.trim()}
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

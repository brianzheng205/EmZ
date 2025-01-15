"use client";

import { useState } from "react";

import CountdownFormInputs from "./CountdownFormInputs";

import { EditEventFn } from "../../types";
import { getAdjustedDate } from "../../../utils";

interface EditCountdownFormProps {
  dateId: string;
  description: string;
  onEdit: EditEventFn;
  onCancel: () => void;
  existingCustomIds: string[];
  isCustomId?: boolean;
}

export default function EditCountdownForm({
  dateId,
  description,
  onEdit,
  onCancel,
  existingCustomIds,
  isCustomId = false,
}: EditCountdownFormProps) {
  // Convert MM-DD-YYYY to YYYY-MM-DD for date input
  const [month, day, year] = dateId.split("-");
  const formattedDate = isCustomId
    ? dateId
    : `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

  const [newId, setNewId] = useState(formattedDate);
  const [newDescription, setNewDescription] = useState(description);
  const [isCustomInput, setIsCustomInput] = useState(isCustomId);

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

    if (!isCustomInput) {
      // Additional check to prevent past dates
      const selectedDate = getAdjustedDate(new Date(newId));
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        return;
      }
    }

    try {
      await onEdit(
        dateId,
        description,
        newId,
        newDescription.trim(),
        isCustomInput
      );
      onCancel();
    } catch (error) {
      console.error("Error editing countdown:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <CountdownFormInputs
        id={newId}
        description={newDescription}
        onIdChange={(id, isCustom) => {
          setNewId(id);
          setIsCustomInput(isCustom);
        }}
        onDescriptionChange={setNewDescription}
        minDate={minDate}
        existingCustomIds={existingCustomIds}
        isCustomId={isCustomInput}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 bg-primary text-white p-2 rounded-md hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!newId || !newDescription.trim()}
        >
          Save
        </button>
      </div>
    </form>
  );
}

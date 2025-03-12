"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import CountdownFormInputs from "./CountdownFormInputs";
import { AddEventFn, EditEventFn } from "../../types";

export default function CountdownForm(props: {
  open: boolean;
  onClose: () => void;
  existingCustomIds: string[];
  // For Add mode
  onAdd?: AddEventFn;
  // For Edit mode
  onEdit?: EditEventFn;
  dateId?: string;
  description?: string;
  isCustomId?: boolean;
}) {
  // Convert MM-DD-YYYY to YYYY-MM-DD for date input if in edit mode
  const initialId = props.dateId && !props.isCustomId
    ? (() => {
        const [month, day, year] = props.dateId.split("-");
        return `${year}-${month}-${day}`;
      })()
    : props.dateId || "";

  const [id, setId] = useState(initialId);
  const [description, setDescription] = useState(props.description || "");
  const [isCustomInput, setIsCustomInput] = useState(Boolean(props.isCustomId));

  const handleClose = () => {
    setId(initialId);
    setDescription(props.description || "");
    setIsCustomInput(Boolean(props.isCustomId));
    props.onClose();
  };

  const handleSubmit = () => {
    if (props.onAdd) {
      props.onAdd(id, description, isCustomInput);
    } else if (props.onEdit && props.dateId && props.description) {
      props.onEdit(props.dateId, props.description, id, description, isCustomInput);
    }
    handleClose();
  };

  const isEditMode = Boolean(props.onEdit);

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? "Edit Countdown" : "Add New Countdown"}</DialogTitle>
      <DialogContent>
        <CountdownFormInputs
          id={id}
          description={description}
          onIdChange={(newId, isCustom) => {
            setId(newId);
            setIsCustomInput(isCustom);
          }}
          onDescriptionChange={setDescription}
          existingCustomIds={props.existingCustomIds}
          isCustomId={isCustomInput}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!id || !description}
        >
          {isEditMode ? "Save" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

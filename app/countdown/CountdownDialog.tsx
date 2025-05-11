"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Stack,
  FormControlLabel,
} from "@mui/material";
import { useState, useEffect } from "react";

import { CountdownEventDialogProps } from "../types"; // Import the base props type

interface CountdownDialogInputsProps {
  id: string;
  description: string;
  onIdChange: (id: string, isCustom: boolean) => void;
  onDescriptionChange: (description: string) => void;
  handleSubmit: () => void;
  existingCustomIds: string[];
  isCustomId: boolean;
}

function CountdownDialogInputs({
  id,
  description,
  onIdChange,
  onDescriptionChange,
  handleSubmit,
  existingCustomIds,
  isCustomId,
}: CountdownDialogInputsProps) {
  const [customId, setCustomId] = useState(isCustomId ? id : "");
  const [dateId, setDateId] = useState(isCustomId ? "" : id);
  const [idError, setIdError] = useState("");

  useEffect(() => {
    if (!id) return;

    if (isCustomId) {
      setCustomId(id);
    } else {
      setDateId(id);
    }
  }, [id, isCustomId]);

  const handleIdTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isCustom = event.target.value === "custom";
    setIdError("");

    if (isCustom) {
      onIdChange(customId, true);
    } else {
      onIdChange(dateId, false);
    }
  };

  const handleCustomIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newId = event.target.value;
    setCustomId(newId);

    // Validate custom ID
    if (existingCustomIds.includes(newId)) {
      setIdError("This ID already exists");
    } else {
      setIdError("");
      onIdChange(newId, true);
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    setDateId(newDate);
    onIdChange(newDate, false);
  };

  // Get minimum date (today) for date input
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Stack spacing={3}>
      <FormControl>
        <FormLabel>Event Type</FormLabel>
        <RadioGroup
          row
          value={isCustomId ? "custom" : "date"}
          onChange={handleIdTypeChange}
        >
          <FormControlLabel value="date" control={<Radio />} label="Date" />
          <FormControlLabel
            value="custom"
            control={<Radio />}
            label="Custom Text"
          />
        </RadioGroup>
      </FormControl>

      {isCustomId ? (
        <TextField
          label="Custom Text"
          value={customId}
          onChange={handleCustomIdChange}
          error={Boolean(idError)}
          helperText={idError}
          fullWidth
          required
          size="small"
          margin="dense"
        />
      ) : (
        <TextField
          label="Date"
          type="date"
          value={dateId}
          onChange={handleDateChange}
          fullWidth
          required
          size="small"
          margin="dense"
          slotProps={{
            htmlInput: {
              min: minDate,
            },
          }}
        />
      )}

      <TextField
        label="Description"
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="e.g. 4-year 'ILY' anniversary. ❤️"
        required
        fullWidth
        size="small"
        margin="dense"
        multiline
        rows={2}
      />
    </Stack>
  );
}

type CountdownDialogProps = CountdownEventDialogProps & {
  title: string;
  submitText: string;
};

export default function CountdownDialog({
  title,
  submitText,
  dateId,
  isCustomId,
  description: initialDescription,
  open,
  onClose,
  onSubmit,
  existingCustomIds,
}: CountdownDialogProps) {
  // Convert MM-DD-YYYY to YYYY-MM-DD for date input if in edit mode
  const initialId =
    dateId && !isCustomId
      ? (() => {
          const [month, day, year] = dateId.split("-");
          return `${year}-${month}-${day}`;
        })()
      : dateId || "";

  const [id, setId] = useState(initialId);
  const [description, setDescription] = useState(initialDescription || "");
  const [isCustomInput, setIsCustomInput] = useState(Boolean(isCustomId));

  useEffect(() => {
    if (open) {
      setId(initialId);
      setDescription(initialDescription || "");
      setIsCustomInput(Boolean(isCustomId));
    }
  }, [open, initialId, initialDescription, isCustomId]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    if (!id || !description) return;
    onSubmit(id, description, isCustomInput);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <CountdownDialogInputs
          id={id}
          description={description}
          onIdChange={(newId, isCustom) => {
            setId(newId);
            setIsCustomInput(isCustom);
          }}
          onDescriptionChange={setDescription}
          existingCustomIds={existingCustomIds}
          isCustomId={isCustomInput}
          handleSubmit={handleSubmit}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!id || !description}>
          {submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

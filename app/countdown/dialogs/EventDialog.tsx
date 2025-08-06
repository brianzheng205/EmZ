"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";
import { useState, useEffect } from "react";

import { EventDialogSharedProps } from "../types";

type EventDialogProps = EventDialogSharedProps & {
  title: string;
  submitText: string;
  initialInputs?: { date: string; description: string };
};

export default function EventDialog({
  title,
  submitText,
  open,
  onClose: handleClose,
  onSubmit,
  initialInputs = { date: "", description: "" },
}: EventDialogProps) {
  // Get minimum date (today) for date input
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const [date, setDate] = useState(initialInputs.date);
  const [description, setDescription] = useState(initialInputs.description);

  useEffect(() => {
    if (open) {
      setDate(initialInputs.date);
      setDescription(initialInputs.description);
    }
  }, [open, initialInputs.date, initialInputs.description]);

  const handleSubmit = () => {
    if (!description) return;
    onSubmit(date, description);
    handleClose();
  };

  const handleKeyPress = async (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  // TODO use custom general dialog component
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <Stack gap={3}>
          {/* TODO Replace with MUI DatePicker */}
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            fullWidth
            size="small"
            margin="dense"
            slotProps={{
              htmlInput: {
                min: minDate,
              },
            }}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="error">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!description}>
          {submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

"use client";

import { toDate } from "@lib/utils";
import { TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useState, useEffect } from "react";

import DialogWrapper from "@/components/DialogWrapper";
import { toISODateStr } from "@/utils";

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
  const [date, setDate] = useState<Date | null>(toDate(initialInputs.date));
  const [description, setDescription] = useState(initialInputs.description);

  useEffect(() => {
    if (open) {
      setDate(toDate(initialInputs.date));
      setDescription(initialInputs.description);
    }
  }, [open, initialInputs.date, initialInputs.description]);

  const handleSubmit = () => {
    if (!description) return;
    onSubmit(toISODateStr(date), description);
    handleClose();
  };

  const handleKeyPress = async (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <DialogWrapper
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title={title}
      submitText={submitText}
      disabled={!description}
      contentSx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        width: 500,
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Date"
          value={date}
          onChange={(newValue) => setDate(newValue)}
          minDate={new Date()}
          slotProps={{
            actionBar: {
              actions: ["clear"],
            },
          }}
        />
      </LocalizationProvider>

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
        rows={3}
      />
    </DialogWrapper>
  );
}

import { TextField } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import * as R from "ramda";
import { useState, useEffect } from "react";

import DialogWrapper from "@/components/DialogWrapper";

import { IdToDate, Metadata } from "../types";

interface DateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (metadata: Metadata) => void;
  title: string;
  submitText: string;
  dates: IdToDate;
  initialMetadata?: Metadata;
}

export default function DateDialog({
  open,
  onClose,
  onSubmit,
  title,
  submitText,
  dates,
  initialMetadata,
}: DateDialogProps) {
  const [name, setName] = useState<string>(
    initialMetadata ? initialMetadata.name : ""
  );
  const [date, setDate] = useState<Date | null>(
    initialMetadata ? initialMetadata.date : null
  );

  useEffect(() => {
    if (open) {
      setName(initialMetadata ? initialMetadata.name : "");
      setDate(initialMetadata ? initialMetadata.date : null);
    }
  }, [open, initialMetadata]);

  const nameExists = Object.values(dates).some((d) => name === d.name);
  const dateExists = Object.values(dates).some(
    (d) => R.isNotNil(date) && date === d.date
  );
  const areSomeInputsInvalid =
    (name.length > 0 && name.trim() === "") ||
    (nameExists && dateExists) ||
    !date;

  const handleSubmit = () => {
    if (!date) {
      console.error("No date selected.");
      return;
    }
    onSubmit({
      name,
      date,
    });
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DialogWrapper
        open={open}
        onClose={onClose}
        onSubmit={handleSubmit}
        title={title}
        submitText={submitText}
        disabled={areSomeInputsInvalid}
        contentSx={{ display: "flex", flexDirection: "column", gap: 1 }}
      >
        <TextField
          autoFocus
          margin="dense"
          label="Date Name"
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <DatePicker
          label="Date"
          value={date}
          onChange={(newValue) => setDate(newValue)}
          minDate={new Date()}
        />
      </DialogWrapper>
    </LocalizationProvider>
  );
}

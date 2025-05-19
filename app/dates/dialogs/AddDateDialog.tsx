import { TextField } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useState } from "react";

import DialogWrapper from "@/components/DialogWrapper";

import { FirebaseIdToDate, FirebaseMetadata } from "../types";
import { convertDateToString } from "../utils";

interface AddBudgetDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (metadata: FirebaseMetadata) => void;
  dates: FirebaseIdToDate;
}

export default function AddBudgetDialog({
  open,
  onClose,
  onSubmit,
  dates,
}: AddBudgetDialogProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date | null>(null);

  const areSomeInputsInvalid =
    name.trim() === "" ||
    !date ||
    Object.values(dates).some((budget) => budget.name === name);

  const handleSubmit = () => {
    if (!date) {
      console.error("No date selected.");
      return;
    }
    onSubmit({
      name,
      date: convertDateToString(date),
    });
    onClose();
    setName("");
    setDate(null);
  };

  const handleClose = () => {
    setName("");
    setDate(null);
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DialogWrapper
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        title="Add New Date"
        disabled={areSomeInputsInvalid}
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
        />
      </DialogWrapper>
    </LocalizationProvider>
  );
}

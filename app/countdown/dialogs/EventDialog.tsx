"use client";

import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { PickerValue } from "@mui/x-date-pickers/internals";
import { useState, useEffect } from "react";

import DialogWrapper from "@/components/DialogWrapper";
import { toISODateStr } from "@/utils";
import { RepeatFrequency } from "@lib/types/countdown";
import { toDate } from "@lib/utils";

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
  const [repeat, setIsRepeating] = useState(RepeatFrequency.Never);
  const [description, setDescription] = useState(initialInputs.description);

  useEffect(() => {
    if (open) {
      setDate(toDate(initialInputs.date));
      setDescription(initialInputs.description);
    }
  }, [open, initialInputs.date, initialInputs.description]);

  const handleDateChange = (newDate: PickerValue) => {
    if (newDate === null) setIsRepeating(RepeatFrequency.Never);
    setDate(newDate);
  };

  const handleRepeatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsRepeating(event.target.value as RepeatFrequency);
  };

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
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Date"
          value={date}
          onChange={handleDateChange}
          minDate={new Date()}
          slotProps={{
            actionBar: {
              actions: ["clear"],
            },
          }}
        />
      </LocalizationProvider>

      <FormControl disabled={date === null}>
        <FormLabel id="repeat-label">Repeat</FormLabel>
        <RadioGroup
          aria-labelledby="repeat-label"
          name="repeat"
          value={repeat}
          onChange={handleRepeatChange}
        >
          <FormControlLabel
            value={RepeatFrequency.Never}
            control={<Radio />}
            label={RepeatFrequency.Never}
          />
          <FormControlLabel
            value={RepeatFrequency.Daily}
            control={<Radio />}
            label={RepeatFrequency.Daily}
          />
          <FormControlLabel
            value={RepeatFrequency.Weekly}
            control={<Radio />}
            label={RepeatFrequency.Weekly}
          />
          <FormControlLabel
            value={RepeatFrequency.Biweekly}
            control={<Radio />}
            label={RepeatFrequency.Biweekly}
          />
          <FormControlLabel
            value={RepeatFrequency.Monthly}
            control={<Radio />}
            label={RepeatFrequency.Monthly}
          />
          <FormControlLabel
            value={RepeatFrequency.Yearly}
            control={<Radio />}
            label={RepeatFrequency.Yearly}
          />
        </RadioGroup>
      </FormControl>

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

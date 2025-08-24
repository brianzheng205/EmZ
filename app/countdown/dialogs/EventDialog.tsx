"use client";

import {
  FormControl,
  MenuItem,
  InputLabel,
  Select,
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

import { EditEventDialogProps } from "../types";

const REPEAT_FREQ_SELECT = "repeat-frequency-select";
const repeatFreqSelect = {
  ID: REPEAT_FREQ_SELECT,
  LABEL_ID: `${REPEAT_FREQ_SELECT}-label`,
  LABEL: "Repeat Frequency",
};

type EventDialogProps = EditEventDialogProps & {
  title: string;
  submitText: string;
};

export default function EventDialog({
  title,
  submitText,
  open,
  onClose: handleClose,
  onSubmit,
  initialEventData = {
    date: "",
    repeatFreq: RepeatFrequency.Never,
    description: "",
  },
}: EventDialogProps) {
  const [date, setDate] = useState<Date | null>(toDate(initialEventData.date));
  const [repeatFreq, setRepeatFreq] = useState(initialEventData.repeatFreq);
  const [description, setDescription] = useState(initialEventData.description);

  useEffect(() => {
    if (open) {
      setDate(toDate(initialEventData.date));
      setDescription(initialEventData.description);
    }
  }, [open, initialEventData.date, initialEventData.description]);

  const handleDateChange = (newDate: PickerValue) => {
    if (newDate === null) setRepeatFreq(RepeatFrequency.Never);
    setDate(newDate);
  };

  const handleRepeatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRepeatFreq(event.target.value as RepeatFrequency);
  };

  const handleSubmit = () => {
    if (!description) return;
    onSubmit(toISODateStr(date), repeatFreq, description);
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
        <InputLabel id={repeatFreqSelect.LABEL_ID}>
          {repeatFreqSelect.LABEL}
        </InputLabel>

        <Select
          labelId={repeatFreqSelect.LABEL_ID}
          id={repeatFreqSelect.ID}
          value={repeatFreq}
          label={repeatFreqSelect.LABEL}
          onChange={handleRepeatChange}
        >
          <MenuItem value={RepeatFrequency.Never}>
            {RepeatFrequency.Never}
          </MenuItem>
          <MenuItem value={RepeatFrequency.Daily}>
            {RepeatFrequency.Daily}
          </MenuItem>
          <MenuItem value={RepeatFrequency.Weekly}>
            {RepeatFrequency.Weekly}
          </MenuItem>
          <MenuItem value={RepeatFrequency.Biweekly}>
            {RepeatFrequency.Biweekly}
          </MenuItem>
          <MenuItem value={RepeatFrequency.Monthly}>
            {RepeatFrequency.Monthly}
          </MenuItem>
          <MenuItem value={RepeatFrequency.Yearly}>
            {RepeatFrequency.Yearly}
          </MenuItem>
        </Select>
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

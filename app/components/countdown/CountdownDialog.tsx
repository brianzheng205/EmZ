"use client";

import { useState, useEffect } from "react";
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
import { AddEventFn, EditEventFn } from "../../types";

function CountdownDialogInputs(props: {
  id: string;
  description: string;
  onIdChange: (id: string, isCustom: boolean) => void;
  onDescriptionChange: (description: string) => void;
  handleSubmit: () => void;
  existingCustomIds: string[];
  isCustomId: boolean;
}) {
  const [customId, setCustomId] = useState(props.isCustomId ? props.id : "");
  const [dateId, setDateId] = useState(props.isCustomId ? "" : props.id);
  const [idError, setIdError] = useState("");

  useEffect(() => {
    if (!props.id) return;

    if (props.isCustomId) {
      setCustomId(props.id);
    } else {
      setDateId(props.id);
    }
  }, [props.id, props.isCustomId]);

  const handleIdTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isCustom = event.target.value === "custom";
    setIdError("");

    if (isCustom) {
      props.onIdChange(customId, true);
    } else {
      props.onIdChange(dateId, false);
    }
  };

  const handleCustomIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newId = event.target.value;
    setCustomId(newId);

    // Validate custom ID
    if (props.existingCustomIds.includes(newId)) {
      setIdError("This ID already exists");
    } else {
      setIdError("");
      props.onIdChange(newId, true);
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    setDateId(newDate);
    props.onIdChange(newDate, false);
  };

  // Get minimum date (today) for date input
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      props.handleSubmit();
    }
  };

  return (
    <Stack spacing={3}>
      <FormControl>
        <FormLabel>Event Type</FormLabel>
        <RadioGroup
          row
          value={props.isCustomId ? "custom" : "date"}
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

      {props.isCustomId ? (
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
        value={props.description}
        onChange={(e) => props.onDescriptionChange(e.target.value)}
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

export default function CountdownDialog(props: {
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
  const initialId =
    props.dateId && !props.isCustomId
      ? (() => {
          const [month, day, year] = props.dateId.split("-");
          return `${year}-${month}-${day}`;
        })()
      : props.dateId || "";

  const [id, setId] = useState(initialId);
  const [description, setDescription] = useState(props.description || "");
  const [isCustomInput, setIsCustomInput] = useState(Boolean(props.isCustomId));

  useEffect(() => {
    if (props.open) {
      setId(initialId);
      setDescription(props.description || "");
      setIsCustomInput(Boolean(props.isCustomId));
    }
  }, [props.open]);

  const handleClose = () => {
    props.onClose();
  };

  const handleSubmit = () => {
    if (props.onAdd) {
      props.onAdd(id, description, isCustomInput);
    } else if (props.onEdit && props.dateId && props.description) {
      props.onEdit(
        props.dateId,
        props.description,
        id,
        description,
        isCustomInput
      );
    }
    handleClose();
  };

  const isEditMode = Boolean(props.onEdit);

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditMode ? "Edit Countdown" : "Add New Countdown"}
      </DialogTitle>
      <DialogContent>
        <CountdownDialogInputs
          id={id}
          description={description}
          onIdChange={(newId, isCustom) => {
            setId(newId);
            setIsCustomInput(isCustom);
          }}
          onDescriptionChange={setDescription}
          existingCustomIds={props.existingCustomIds}
          isCustomId={isCustomInput}
          handleSubmit={handleSubmit}
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

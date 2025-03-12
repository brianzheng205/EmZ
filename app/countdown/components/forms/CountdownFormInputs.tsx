"use client";

import { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Autocomplete,
  Stack,
  FormLabel,
} from "@mui/material";

interface CountdownFormInputsProps {
  id: string;
  description: string;
  onIdChange: (id: string, isCustom: boolean) => void;
  onDescriptionChange: (description: string) => void;
  existingCustomIds: string[];
  isCustomId: boolean;
}

export default function CountdownFormInputs(props: CountdownFormInputsProps) {
  const [customId, setCustomId] = useState(props.isCustomId ? props.id : "");
  const [dateId, setDateId] = useState(props.isCustomId ? "" : props.id);
  const [idError, setIdError] = useState("");

  useEffect(() => {
    if (props.id) {
      if (props.isCustomId) {
        setCustomId(props.id);
      } else {
        // Convert MM-DD-YYYY to YYYY-MM-DD
        const [month, day, year] = props.id.split("-");
        setDateId(`${year}-${month}-${day}`);
      }
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
          <FormControlLabel value="custom" control={<Radio />} label="Custom Text" />
        </RadioGroup>
      </FormControl>

      <Box minHeight={80}>
        {props.isCustomId ? (
          <FormControl fullWidth>
            <FormLabel>Custom Text</FormLabel>
            <TextField
              label="Custom ID"
              value={customId}
              onChange={handleCustomIdChange}
              error={Boolean(idError)}
              helperText={idError}
              fullWidth
              required
              size="small"
              margin="dense"
            />
          </FormControl>
        ) : (
          <FormControl fullWidth>
            <FormLabel>Date</FormLabel>
            <TextField
              label="Date"
              type="date"
              value={dateId}
              onChange={handleDateChange}
              fullWidth
              required
              size="small"
              margin="dense"
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: minDate,
              }}
            />
          </FormControl>
        )}
      </Box>

      <FormControl fullWidth>
        <FormLabel>Description</FormLabel>
        <TextField
          label="Description"
          value={props.description}
          onChange={(e) => props.onDescriptionChange(e.target.value)}
          placeholder="e.g. 4-year 'ILY' anniversary. ❤️"
          required
          fullWidth
          size="small"
          margin="dense"
          multiline
          rows={2}
        />
      </FormControl>
    </Stack>
  );
}

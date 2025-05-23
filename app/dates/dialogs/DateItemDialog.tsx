import {
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";

import DialogWrapper from "@/components/DialogWrapper";

import { ACTIVITY_TYPES } from "../constants";
import { ActivityType, ListRow, FirestoreListItem } from "../types";
import { isValidListItem } from "../utils";

interface DateItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (listItem: ListRow) => void;
  title: string;
  submitText: string;
  dateListItems: ListRow[];
  initialData?: FirestoreListItem;
}

export default function DateItemDialog({
  open,
  onClose,
  onSubmit,
  title,
  submitText,
  dateListItems,
  initialData,
}: DateItemDialogProps) {
  const nameInit = useMemo(() => initialData?.name ?? "", [initialData]);
  const placeIdInit = useMemo(() => initialData?.placeId ?? "", [initialData]);
  const durationInit = useMemo(() => initialData?.duration ?? 0, [initialData]);
  const costInit = useMemo(() => initialData?.cost ?? 0, [initialData]);
  const activityTypeInit = useMemo(
    () => initialData?.activityType ?? "Other",
    [initialData]
  );
  const notesInit = useMemo(() => initialData?.notes ?? "", [initialData]);

  const [name, setName] = useState(nameInit);
  const [placeId, setPlaceId] = useState(placeIdInit);
  const [duration, setDuration] = useState(durationInit);
  const [cost, setCost] = useState(costInit);
  const [activityType, setActivityType] = useState(activityTypeInit);
  const [notes, setNotes] = useState(notesInit);

  useEffect(() => {
    if (open) {
      setName(nameInit);
      setPlaceId(placeIdInit);
      setDuration(durationInit);
      setCost(costInit);
      setActivityType(activityTypeInit);
      setNotes(notesInit);
    }
  }, [
    open,
    initialData,
    nameInit,
    placeIdInit,
    durationInit,
    costInit,
    activityTypeInit,
    notesInit,
  ]);

  const handleSubmit = () => {
    const newItem = {
      name,
      placeId,
      duration,
      cost,
      activityType,
      notes,
    } as ListRow;
    onSubmit(newItem);
    onClose();
  };

  const disabled = !isValidListItem(
    dateListItems,
    {
      name,
      placeId,
      duration,
      cost,
      activityType,
      notes,
    } as ListRow,
    true
  );

  return (
    <DialogWrapper
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={title}
      submitText={submitText}
      disabled={disabled}
      contentSx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Grid container columnSpacing={2}>
        <Grid size={6}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="dense"
            fullWidth
          />
        </Grid>
        <Grid size={6}>
          <TextField
            label="Place ID"
            value={placeId}
            onChange={(e) => setPlaceId(e.target.value)}
            margin="dense"
            fullWidth
          />
        </Grid>
        <Grid size={6}>
          <TextField
            label="Duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            margin="dense"
            fullWidth
          />
        </Grid>
        <Grid size={6}>
          <TextField
            label="Cost"
            type="number"
            value={cost}
            onChange={(e) => setCost(Number(e.target.value))}
            margin="dense"
            fullWidth
          />
        </Grid>
        <Grid size={6}>
          <FormControl margin="dense" fullWidth>
            <InputLabel id="activity-type-select-label">
              Activity Type
            </InputLabel>
            <Select
              labelId="activity-type-select-label"
              value={activityType}
              label="Activity Type"
              onChange={(e) => setActivityType(e.target.value as ActivityType)}
            >
              {ACTIVITY_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={12}>
          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            margin="dense"
            fullWidth
          />
        </Grid>
      </Grid>
    </DialogWrapper>
  );
}

import { Delete } from "@mui/icons-material";
import {
  Stack,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
  Button,
} from "@mui/material";
import { useState, useEffect } from "react";

import DialogWrapper from "@/components/DialogWrapper";

import { ACTIVITY_TYPES } from "../../constants";
import {
  ScheduleItemType,
  ListRowWithPlaces,
  FirestoreListItemWithPlace,
} from "../../types";
import { isValidListItem } from "../../utils";

interface DateItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (listItem: FirestoreListItemWithPlace) => void;
  title: string;
  submitText: string;
  dateListItems: ListRowWithPlaces[];
  addedPlace: google.maps.places.Place | null;
  setAddedPlace: (place: google.maps.places.Place | null) => void;
  onSelectMap: () => void;
}

export default function DateItemDialog({
  open,
  onClose,
  onSubmit,
  title,
  submitText,
  dateListItems,
  addedPlace,
  setAddedPlace,
  onSelectMap,
}: DateItemDialogProps) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(0);
  const [cost, setCost] = useState(0);
  const [activityType, setActivityType] = useState<ScheduleItemType>("Fun");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setName(addedPlace?.displayName || "");
    }
  }, [open, addedPlace]);

  const handleClose = () => {
    setName("");
    setDuration(0);
    setCost(0);
    setActivityType("Fun");
    setNotes("");
    setAddedPlace(null);
    onClose();
  };

  const handleSubmit = () => {
    const newItem = {
      name,
      place: addedPlace,
      duration,
      cost,
      activityType,
      notes,
    } as FirestoreListItemWithPlace;
    onSubmit(newItem);
    handleClose();
  };

  const disabled = !isValidListItem(
    dateListItems,
    {
      name,
      place: addedPlace,
      duration,
      cost,
      activityType,
      notes,
    } as ListRowWithPlaces,
    true
  );

  return (
    <DialogWrapper
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title={title}
      submitText={submitText}
      disabled={disabled}
      contentSx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Stack sx={{ gap: 1 }}>
        {addedPlace?.displayName ? (
          <Button onClick={() => setAddedPlace(null)} startIcon={<Delete />}>
            {`Clear ${addedPlace.displayName}`}
          </Button>
        ) : (
          <Button onClick={onSelectMap}>Select From Map</Button>
        )}

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
                onChange={(e) =>
                  setActivityType(e.target.value as ScheduleItemType)
                }
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
      </Stack>
    </DialogWrapper>
  );
}

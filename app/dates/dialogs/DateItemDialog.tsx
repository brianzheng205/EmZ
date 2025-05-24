import { Delete } from "@mui/icons-material";
import {
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
  Stack,
  Tabs,
  Tab,
  InputAdornment,
  Button,
} from "@mui/material";
import { useState, useEffect } from "react";

import DialogWrapper from "@/components/DialogWrapper";
import MapWithSearch from "@/components/maps/MapWithSearch";

import { ACTIVITY_TYPES } from "../constants";
import { ActivityType, ListRow } from "../types";
import { isValidListItem } from "../utils";

enum TabValue {
  MAPS = "maps",
  MANUAL = "manual",
}

interface DateItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (listItem: ListRow) => void;
  title: string;
  submitText: string;
  dateListItems: ListRow[];
}

export default function DateItemDialog({
  open,
  onClose,
  onSubmit,
  title,
  submitText,
  dateListItems,
}: DateItemDialogProps) {
  const [activeTab, setActiveTab] = useState<TabValue>(TabValue.MAPS);

  // Map input states
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.Place | null>(null);
  const [placeId, setPlaceId] = useState("");

  // Manual input states
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(0);
  const [cost, setCost] = useState(0);
  const [activityType, setActivityType] = useState<ActivityType>("Other");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setActiveTab(TabValue.MAPS);
      setName("");
      setDuration(0);
      setCost(0);
      setActivityType("Other");
      setNotes("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (activeTab === TabValue.MAPS && selectedPlace) {
      setName(selectedPlace.displayName || "");
      setPlaceId(selectedPlace.id);
      setActiveTab(TabValue.MANUAL);
    } else if (activeTab === TabValue.MANUAL) {
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
    }
  };

  const disabled =
    (activeTab === TabValue.MAPS && !selectedPlace) ||
    (activeTab === TabValue.MANUAL &&
      !isValidListItem(
        dateListItems,
        {
          name,
          placeId: "",
          duration,
          cost,
          activityType,
          notes,
        } as ListRow,
        true
      ));

  const renderMapInputs = () => (
    <MapWithSearch
      selectedPlace={selectedPlace}
      onPlaceSelect={setSelectedPlace}
      existingPlaceIds={dateListItems
        .map((item) => item.placeId)
        .filter((placeId) => placeId !== "")}
    />
  );

  const renderManualInputs = () => (
    <Stack sx={{ gap: 1 }}>
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
            label="Place ID"
            type="string"
            value={placeId}
            margin="dense"
            fullWidth
            helperText="This will be filled automatically when selecting a place on the map."
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end" sx={{ padding: 0 }}>
                    <Button
                      onClick={() => {
                        setPlaceId("");
                        setSelectedPlace(null);
                      }}
                      variant="text"
                      disabled={!placeId}
                    >
                      <Delete />
                    </Button>
                  </InputAdornment>
                ),
              },
            }}
            disabled
          />
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
        gap: 2,
        width: 600,
        height: 400,
      }}
    >
      <Stack sx={{ flexDirection: "row" }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
        >
          <Tab label={TabValue.MAPS} value={TabValue.MAPS} />
          <Tab label={TabValue.MANUAL} value={TabValue.MANUAL} />
        </Tabs>
      </Stack>

      {activeTab === TabValue.MAPS ? renderMapInputs() : renderManualInputs()}
    </DialogWrapper>
  );
}

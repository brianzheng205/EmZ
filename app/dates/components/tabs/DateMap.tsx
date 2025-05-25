import { Add } from "@mui/icons-material";
import { Stack, Button } from "@mui/material";
import * as R from "ramda";
import { useEffect } from "react";

import MapWithSearch from "@/components/maps/MapWithSearch";

import { ListRowWithPlaces } from "../../types";

interface DateMapProps {
  selectedPlace: google.maps.places.Place | null;
  setSelectedPlace: (place: google.maps.places.Place | null) => void;
  dateListItems: ListRowWithPlaces[];
  onAddPlace: (place: google.maps.places.Place | null) => void;
}

export default function DateMap({
  selectedPlace,
  setSelectedPlace,
  dateListItems,
  onAddPlace,
}: DateMapProps) {
  useEffect(() => {
    setSelectedPlace(null);
  }, [setSelectedPlace]);

  return (
    <Stack sx={{ flex: 1, gap: 1 }}>
      <MapWithSearch
        selectedPlace={selectedPlace}
        onPlaceSelect={setSelectedPlace}
        existingPlaces={dateListItems
          .map((item) => item.place)
          .filter((place) => R.isNotNil(place))}
      />

      <Button
        startIcon={<Add />}
        onClick={() => onAddPlace(selectedPlace)}
        disabled={!selectedPlace}
      >
        {selectedPlace?.displayName}
      </Button>
    </Stack>
  );
}

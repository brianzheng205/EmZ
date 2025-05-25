import { Add } from "@mui/icons-material";
import { Stack, Button } from "@mui/material";
import { useEffect } from "react";

import MapWithSearch from "@/components/maps/MapWithSearch";

interface DateMapProps {
  selectedPlace: google.maps.places.Place | null;
  setSelectedPlace: (place: google.maps.places.Place | null) => void;
  dateListItems: { placeId: string }[];
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
        existingPlaceIds={dateListItems
          .map((item) => item.placeId)
          .filter((placeId) => placeId !== "")}
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

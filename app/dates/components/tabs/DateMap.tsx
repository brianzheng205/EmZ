import { Add } from "@mui/icons-material";
import { Stack, Button } from "@mui/material";
import * as R from "ramda";
import { useEffect } from "react";

import MapWithSearch from "@/components/maps/MapWithSearch";

import { ListRowWithPlaces, PlannerRowWithPlace } from "../../types";

interface DateMapProps {
  selectedPlace: google.maps.places.Place | null;
  setSelectedPlace: (place: google.maps.places.Place | null) => void;
  dateListItems: ListRowWithPlaces[];
  onAddPlace: (place: google.maps.places.Place | null) => void;
  plannerRows: PlannerRowWithPlace[];
}

export default function DateMap({
  selectedPlace,
  setSelectedPlace,
  dateListItems,
  onAddPlace,
  plannerRows,
}: DateMapProps) {
  const plannerPlaceIds = new Set(
    plannerRows.map((row) => row.place?.id).filter((place) => R.isNotNil(place))
  );
  const highlightedPlaces: google.maps.places.Place[] = dateListItems
    .map((item) => item.place)
    .filter(
      (place) => R.isNotNil(place) && plannerPlaceIds.has(place.id)
    ) as google.maps.places.Place[];

  const unhighlightedPlaces: google.maps.places.Place[] = dateListItems
    .map((item) => item.place)
    .filter(
      (place) => R.isNotNil(place) && !plannerPlaceIds.has(place.id)
    ) as google.maps.places.Place[];

  useEffect(() => {
    setSelectedPlace(null);
  }, [setSelectedPlace]);

  return (
    <Stack sx={{ flex: 1, gap: 1 }}>
      <MapWithSearch
        selectedPlace={selectedPlace}
        onPlaceSelect={setSelectedPlace}
        highlightedPlaces={highlightedPlaces}
        unhighlightedPlaces={unhighlightedPlaces}
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

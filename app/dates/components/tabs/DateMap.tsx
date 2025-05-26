import { Add } from "@mui/icons-material";
import { Stack, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import * as R from "ramda";
import { useEffect } from "react";

import MapWithSearch, { PlaceWithColor } from "@/components/maps/MapWithSearch";

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
  const theme = useTheme();

  const plannerPlaceIds = new Set(
    plannerRows.map((row) => row.place?.id).filter((place) => R.isNotNil(place))
  );
  const places: PlaceWithColor[] = dateListItems
    .filter((item) => R.isNotNil(item.place))
    .map((item) => ({
      ...item.place,
      background:
        item.place && plannerPlaceIds.has(item.place.id)
          ? theme.palette.secondary.main
          : undefined,
      glyphColor:
        item.place && plannerPlaceIds.has(item.place.id)
          ? theme.palette.primary.main
          : undefined,
    })) as PlaceWithColor[];

  useEffect(() => {
    setSelectedPlace(null);
  }, [setSelectedPlace]);

  return (
    <Stack sx={{ flex: 1, gap: 1 }}>
      <MapWithSearch
        selectedPlace={selectedPlace}
        onPlaceSelect={setSelectedPlace}
        places={places}
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

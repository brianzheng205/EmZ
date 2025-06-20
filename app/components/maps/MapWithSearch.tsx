"use client";

import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  ControlPosition,
  MapControl,
  AdvancedMarker,
  Pin,
  InfoWindow,
  Map,
  useMap,
} from "@vis.gl/react-google-maps";
import { useEffect, useRef, useCallback, useState } from "react";

import { TXI_BOSTON } from "./constants";
import { getPlaceFromId } from "./utils";

export type PlaceWithColor = google.maps.places.Place & {
  background?: string;
  glyphColor?: string;
};

interface MapHandlerProps {
  place: google.maps.places.Place | null;
}

function MapHandler({ place }: MapHandlerProps) {
  const map = useMap();

  // Handle the main selected place
  useEffect(() => {
    if (!map || !place) return;

    if (place.viewport) {
      map.fitBounds(place.viewport);
    } else if (place.location) {
      map.setCenter(place.location);
      map.setZoom(16);
    }
  }, [map, place]);

  return null;
}

interface PlaceAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.Place | null) => void;
}

function PlaceAutocomplete({ onPlaceSelect }: PlaceAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteRef =
    useRef<google.maps.places.PlaceAutocompleteElement | null>(null);
  const isInitializedRef = useRef(false);

  const handleSelect = useCallback(
    async (event) => {
      const place = event?.placePrediction?.toPlace?.();
      if (!place) return;

      await place.fetchFields({
        fields: [
          "displayName",
          "formattedAddress",
          "location",
          "viewport",
          "id",
        ],
      });

      onPlaceSelect(place.toJSON());
    },
    [onPlaceSelect]
  );

  const cleanup = useCallback(() => {
    const container = containerRef.current;
    const autocomplete = autocompleteRef.current;

    if (autocomplete) {
      // Remove event listener first
      autocomplete.removeEventListener("gmp-select", handleSelect);

      // Remove from DOM if still attached
      if (container?.contains(autocomplete)) {
        container.removeChild(autocomplete);
      }

      autocompleteRef.current = null;
    }

    // Clean up any remaining autocomplete elements
    if (container) {
      const elements = container.querySelectorAll("gmp-place-autocomplete");
      elements.forEach((element) => {
        if (container.contains(element)) {
          container.removeChild(element);
        }
      });
    }

    isInitializedRef.current = false;
  }, [containerRef, handleSelect]);

  useEffect(() => {
    const container = containerRef.current;

    const loadAutocomplete = async () => {
      if (!container || !window.google || isInitializedRef.current) return;

      try {
        // Clean up any existing elements first
        cleanup();

        await window.google.maps.importLibrary("places");

        const placeAutocomplete =
          new window.google.maps.places.PlaceAutocompleteElement({});

        // Set fixed width styles - you can adjust the width as needed
        placeAutocomplete.style.width = "100%";
        placeAutocomplete.style.minWidth = "250px";
        placeAutocomplete.style.maxWidth = "400px";

        placeAutocomplete.addEventListener("gmp-select", handleSelect);
        container.appendChild(placeAutocomplete);

        autocompleteRef.current = placeAutocomplete;
        isInitializedRef.current = true;
      } catch (error) {
        console.error("Error loading place autocomplete:", error);
      }
    };

    // Small delay to ensure proper cleanup before re-initialization
    const timeoutId = setTimeout(loadAutocomplete, 10);

    return () => {
      clearTimeout(timeoutId);
      cleanup();
    };
  }, [onPlaceSelect, cleanup, handleSelect]);

  return <Box ref={containerRef} />;
}

interface InfoWindowWrapperProps {
  place: google.maps.places.Place;
  onCloseClick: () => void;
}

function InfoWindowWrapper({ place, onCloseClick }: InfoWindowWrapperProps) {
  if (!place.location) return null;

  return (
    <InfoWindow position={place.location} onCloseClick={onCloseClick}>
      <Box sx={{ padding: 1, maxWidth: "500px" }}>
        <Typography variant="h6" gutterBottom>
          {place.displayName}
        </Typography>
        <Typography variant="body2" gutterBottom>
          {place.formattedAddress}
        </Typography>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${place.id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            marginTop: 8,
            padding: "6px 12px",
            background: "#4285F4",
            color: "#fff",
            borderRadius: 4,
            textDecoration: "none",
          }}
        >
          Find in Google Maps
        </a>
      </Box>
    </InfoWindow>
  );
}

interface MapWithSearchProps {
  places: PlaceWithColor[];
  selectedPlace: google.maps.places.Place | null;
  onPlaceSelect: (place: google.maps.places.Place | null) => void;
}

export default function MapWithSearch({
  places,
  selectedPlace,
  onPlaceSelect,
}: MapWithSearchProps) {
  const [isSelected, setIsSelected] = useState(false);

  const theme = useTheme();

  const removeSelectedMarker = useCallback(() => setIsSelected(false), []);
  const handlePlaceSelect = useCallback(
    (place: google.maps.places.Place | null) => {
      setIsSelected(true);
      onPlaceSelect(place);
    },
    [onPlaceSelect]
  );

  // Filter out the selected pin from the other places
  const filteredPlaces = places.filter(
    (place) => place.id !== selectedPlace?.id
  );

  return (
    <>
      <Map
        mapId={"defaultMapId"}
        defaultZoom={13}
        defaultCenter={TXI_BOSTON}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        onClick={async (e) => {
          if (e.detail.placeId) {
            e.stop();
            const place = await getPlaceFromId(e.detail.placeId);
            handlePlaceSelect(place);
          } else {
            handlePlaceSelect(null);
          }
        }}
      >
        {selectedPlace && (
          <>
            <AdvancedMarker
              position={selectedPlace.location || null}
              onClick={() => handlePlaceSelect(selectedPlace)}
            >
              <Pin
                background={theme.palette.primary.main}
                glyphColor={"white"}
              />
            </AdvancedMarker>

            {isSelected && (
              <InfoWindowWrapper
                place={selectedPlace}
                onCloseClick={removeSelectedMarker}
              />
            )}
          </>
        )}

        {filteredPlaces.map((place, i) => (
          <AdvancedMarker
            key={i}
            position={place.location || null}
            title={place.displayName || ""}
            onClick={() => handlePlaceSelect(place)}
          >
            <Pin background={place.background} glyphColor={place.glyphColor} />
          </AdvancedMarker>
        ))}
      </Map>

      <MapControl position={ControlPosition.TOP}>
        <Box
          sx={{ width: "400px", padding: 2 }}
          className="autocomplete-control"
        >
          <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />
        </Box>
      </MapControl>

      <MapHandler place={selectedPlace} />
    </>
  );
}

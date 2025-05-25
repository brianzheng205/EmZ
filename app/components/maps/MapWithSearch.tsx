"use client";

import { Box, Typography } from "@mui/material";
import {
  ControlPosition,
  MapControl,
  AdvancedMarker,
  InfoWindow,
  Map,
  useMap,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { useEffect, useRef, useCallback, useState, Fragment } from "react";

import { TXI_BOSTON } from "./constants";

interface MapHandlerProps {
  place: google.maps.places.Place | null;
  marker: google.maps.marker.AdvancedMarkerElement | null;
}

function MapHandler({ place, marker }: MapHandlerProps) {
  const map = useMap();

  // Handle the main selected place
  useEffect(() => {
    if (!map || !place || !marker) return;

    if (place.viewport) {
      map.fitBounds(place.viewport);
    } else if (place.location) {
      map.setCenter(place.location);
      map.setZoom(16);
    }

    marker.position = place.location;
  }, [map, place, marker]);

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

  return <div ref={containerRef} />;
}

interface InfoWindowWrapperProps {
  place: google.maps.places.Place;
  onCloseClick: () => void;
}

function InfoWindowWrapper({ place, onCloseClick }: InfoWindowWrapperProps) {
  if (!place.location) return null;

  return (
    <InfoWindow position={place.location} onCloseClick={onCloseClick}>
      <Box sx={{ padding: 1, maxWidth: "300px" }}>
        <Typography variant="h6" gutterBottom>
          {place.displayName}
        </Typography>
        <Typography variant="body2" gutterBottom>
          {place.formattedAddress}
        </Typography>
        <Typography variant="caption" display="block" gutterBottom>
          <strong>Selected Location</strong>
        </Typography>
      </Box>
    </InfoWindow>
  );
}

interface MapWithSearchProps {
  selectedPlace: google.maps.places.Place | null;
  onPlaceSelect: (place: google.maps.places.Place | null) => void;
  existingPlaces: google.maps.places.Place[];
}

export default function MapWithSearch({
  selectedPlace,
  onPlaceSelect,
  existingPlaces,
}: MapWithSearchProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  const removeSelectedMarker = () => setSelectedMarker(null);

  return (
    <>
      <Map
        mapId={"defaultMapId"}
        defaultZoom={13}
        defaultCenter={TXI_BOSTON}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        onClick={removeSelectedMarker}
      >
        <AdvancedMarker
          ref={markerRef}
          position={null}
          onClick={() => {
            if (selectedPlace) {
              setSelectedMarker("selected");
            }
          }}
        />

        {selectedMarker === "selected" && selectedPlace && (
          <InfoWindowWrapper
            place={selectedPlace}
            onCloseClick={removeSelectedMarker}
          />
        )}

        {existingPlaces.map((place, i) => (
          <Fragment key={i}>
            <AdvancedMarker
              key={place.id}
              position={place.location || null}
              title={place.displayName || ""}
              onClick={() => setSelectedMarker(place.id || "")}
            />

            {selectedMarker === place.id && (
              <InfoWindowWrapper
                place={place}
                onCloseClick={removeSelectedMarker}
              />
            )}
          </Fragment>
        ))}
      </Map>

      <MapControl position={ControlPosition.TOP}>
        <Box
          sx={{ width: "400px", padding: 2 }}
          className="autocomplete-control"
        >
          <PlaceAutocomplete onPlaceSelect={onPlaceSelect} />
        </Box>
      </MapControl>

      <MapHandler place={selectedPlace} marker={marker} />
    </>
  );
}

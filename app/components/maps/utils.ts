export const getPlaceFromId = async (
  placeId: string
): Promise<google.maps.places.Place | null> => {
  if (!placeId) return null;

  try {
    const place = new window.google.maps.places.Place({ id: placeId });
    await place.fetchFields({
      fields: ["displayName", "location", "formattedAddress", "id"],
    });
    return place.toJSON() as google.maps.places.Place;
  } catch (error) {
    console.error(`Failed to fetch place with ID ${placeId}:`, error);
    return null;
  }
};

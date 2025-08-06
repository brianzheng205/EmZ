import { getAdjustedDate } from "@/utils";

import { GroupedEvents } from "./types";

// Helper function to format date string (MM-DD-YYYY)
export const getDateString = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
};

export const getSortedDates = (eventGroups: GroupedEvents) =>
  Object.keys(eventGroups).sort((a, b) =>
    a === "" ? 1 : b === "" ? -1 : a.localeCompare(b)
  );

/**
 *
 * @param dateStr
 * @returns The date string adjusted by the timezone offset
 */
export const addTimeZoneOffset = (dateStr: string): string => {
  const date = new Date(dateStr);
  const adjustedDate = getAdjustedDate(date);
  return getDateString(adjustedDate);
};

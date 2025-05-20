import { Row } from "./types";

/**
 * Converts a Date object to a string in the format "MM/DD/YYYY".
 */
export const convertDateToDateStr = (date: Date): string =>
  `${date.toLocaleString("en-US", {
    month: "numeric",
  })}/${date.toLocaleString("en-US", {
    day: "numeric",
  })}/${date.toLocaleString("en-US", { year: "numeric" })}`;

/**
 * Converts a string in the format "MM/DD/YYYY" to a Date object.
 */
export const convertDateStrToDate = (dateString: string): Date => {
  const [month, day, year] = dateString.split("/").map(Number);
  return new Date(year, month - 1, day);
};

/**
 * @param time in 24-hour format (e.g., "14:30")
 * @returns Date object with the time set
 */
export const convertTimeStrToDate = (time: string): Date => {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  return date;
};

/**
 * @param date Date object
 * @returns string in 24-hour format (e.g., "14:30")
 */
export const convertDateToTimeStr = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

/**
 * Returns duration in minutes between two Dates.
 */
const calculateDuration = (start: Date, end: Date) => {
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60));
};

export const addMinutes = (date: Date, minutes: number): Date =>
  new Date(date.getTime() + minutes * 60 * 1000);

export const convertNumberTo24HourFormat = (number: number): string => {
  const hours = Math.floor(number / 60);
  const minutes = number % 60;
  return hours > 0
    ? `${hours.toString()}:${minutes.toString().padStart(2, "0")}`
    : minutes.toString();
};

/**
 * Returns the next available ID for a new row.
 */
export const getNextAvailableId = (rows: Row[]): number => {
  const ids = new Set(rows.map((row) => row.id));
  let nextId = 1;
  while (ids.has(nextId)) {
    nextId++;
  }
  return nextId;
};

export const recalculateRows = (rows: Row[]): boolean => {
  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1];
    const curr = rows[i];

    if (curr.startTimeFixed) {
      // Duration of previous row = curr.startTime - prev.startTime
      const prevDuration = calculateDuration(prev.startTime, curr.startTime);
      if (prevDuration < 0) return false; // Invalid duration
      prev.duration = prevDuration;
    } else {
      // Flexible: curr.startTime = prev.startTime + prev.duration
      curr.startTime = addMinutes(prev.startTime, prev.duration);
    }
  }

  return true;
};

/**
 * @param time in 24-hour format (e.g., "14:30")
 * @returns time in 12-hour format (e.g., "2:30 PM")
 */
export const convertTo12HourFormat = (time: string): string => {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * @param time in 24-hour format (e.g., "14:30")
 * @returns Date object with the time set
 */
export const convertToDate = (time: string): Date => {
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
export const convertTo24HourFormat = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

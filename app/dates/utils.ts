/**
 * @param time in 24-hour format (e.g., "14:30")
 * @returns time in 12-hour format (e.g., "2:30 PM")
 */
export const convert24To12HourFormat = (time: string): string => {
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
export const convertDateTo24HourFormat = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const calculateDuration = (start: string, end: string) => {
  // Returns duration in minutes between two "HH:mm" strings
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
};

export const addMinutes = (time: string, minutes: number) => {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${nh.toString().padStart(2, "0")}:${nm.toString().padStart(2, "0")}`;
};

export const convertNumberTo24HourFormat = (number: number): string => {
  const hours = Math.floor(number / 60);
  const minutes = number % 60;
  return hours > 0
    ? `${hours.toString()}:${minutes.toString()}`
    : minutes.toString();
};

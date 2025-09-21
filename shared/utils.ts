import { RepeatFrequency, NonNeverRepeatFrequency } from "./types";

// TODO: use built-in Date fn
/**
 * Converts a dateStr in "YYYY-MM-DD" to a Date object in local time.
 * Returns null if the string is empty.
 */
export const toDate = (dateStr: string): Date | null => {
  if (dateStr === "") return null;

  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// TODO: add documentation
export const addDays = (date: Date, numDays: number) => {
  const newDate = new Date(date.getTime());
  newDate.setDate(date.getDate() + numDays);
  return newDate;
};

export const addWeeks = (date: Date, numWeeks: number) => {
  const newDate = new Date(date.getTime());
  newDate.setDate(date.getDate() + numWeeks * 7);
  return newDate;
};

// TODO: fix 31st not existing next month, etc. issue
// should say 30th if 31ist isn't valid and then go back to 31st when possible
export const addMonths = (date: Date, numMonths: number) => {
  const newDate = new Date(date.getTime());
  newDate.setMonth(date.getMonth() + numMonths);
  return newDate;
};

// TODO: fix yearly on leap year
// should say 28th if 29th of february isn't valid and then go back to 28th when possible
export const addYears = (date: Date, numYears: number) => {
  const newDate = new Date(date.getTime());
  newDate.setFullYear(date.getFullYear() + numYears);
  return newDate;
};

export const getNextDate = (
  date: Date,
  repeatFreq: NonNeverRepeatFrequency
): Date => {
  switch (repeatFreq) {
    case RepeatFrequency.Daily:
      return addDays(date, 1);
    case RepeatFrequency.Weekly:
      return addWeeks(date, 1);
    case RepeatFrequency.Biweekly:
      return addWeeks(date, 2);
    // case RepeatFrequency.Monthly:
    //   return addMonths(date, 1);
    // case RepeatFrequency.Yearly:
    //   return addYears(date, 1);
    default:
      console.log("Unsupported repeat frequency:", repeatFreq);
      return date;
  }
};

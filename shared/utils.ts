/**
 * Converts a dateStr in "YYYY-MM-DD" to a Date object in local time.
 * Returns null if the string is empty.
 */
export const toDate = (dateStr: string): Date | null => {
  if (dateStr === "") return null;

  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

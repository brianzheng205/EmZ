/**
 * Converts a string in the format "YYYY/MM/DD" to a Date object.
 */
export const convertDateStrToDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split(/[-/]/).map(Number);
  return new Date(year, month - 1, day);
};

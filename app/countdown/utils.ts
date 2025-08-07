import { GroupedEvents } from "./types";

export const getSortedDates = (eventGroups: GroupedEvents) =>
  Object.keys(eventGroups).sort((a, b) =>
    a === "" ? 1 : b === "" ? -1 : a < b ? -1 : 1
  );

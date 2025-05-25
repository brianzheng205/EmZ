import { ActivityType, ScheduleItemType } from "./types";

export const ACTIVITY_TYPES: ActivityType[] = ["Bulk", "Fun", "Other"];

export const SCHEDULE_ITEM_TYPES: ScheduleItemType[] = [
  ...ACTIVITY_TYPES,
  "Prepare",
  "Public Transport",
  "Uber",
  "Walk",
];

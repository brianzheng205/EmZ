export type ActvityType = "Bulk" | "Fun" | "Other";

export type Row = {
  id: number;
  startTime: string;
  duration: number;
  activity: string;
  type: string;
  notes: string;
};

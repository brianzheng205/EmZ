export type StartTimeType = "fixed" | "calculated";

export type ActvityType = "Prepare" | "Bulk" | "Fun" | "Other" | "";

export type Row = {
  id: number;
  status?: string;
  startTime: string;
  startTimeType: StartTimeType;
  duration: number;
  activity: string;
  type: ActvityType;
  notes: string;
};

export type ActvityType = "Prepare" | "Bulk" | "Fun" | "Other" | "";

export type FirebaseScheduleItem = {
  startTime: string;
  startTimeFixed: boolean;
  duration: number;
  activity: string;
  activtyType: ActvityType;
  notes: string;
};

export type Row = FirebaseScheduleItem & {
  id: number;
};

export type FirebaseMetadata = {
  name: string;
  date: string;
};

export type FirebaseDate = FirebaseMetadata & {
  schedule: FirebaseScheduleItem[];
};

export type FirebaseIdToDate = { [id: string]: FirebaseDate };

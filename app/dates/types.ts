export type ActvityType = "Prepare" | "Bulk" | "Fun" | "Other" | "";

// BACKEND TYPES
export type FirestoreScheduleItem = {
  startTime: string;
  startTimeFixed: boolean;
  duration: number;
  activity: string;
  activtyType: ActvityType;
  notes: string;
};

export type FirestoreMetadata = {
  name: string;
  date: string;
};

export type FirestoreDate = FirestoreMetadata & {
  schedule: FirestoreScheduleItem[];
};

export type FirestoreIdToDate = { [id: string]: FirestoreDate };

// FRONTEND TYPES
export type ScheduleItem = Omit<FirestoreScheduleItem, "startTime"> & {
  startTime: Date;
};

export type Metadata = Omit<FirestoreMetadata, "date"> & {
  date: Date;
};

export type EmZDate = Metadata & {
  schedule: ScheduleItem[];
};

export type IdToDate = { [id: string]: EmZDate };

export type Row = ScheduleItem & {
  id: number;
};

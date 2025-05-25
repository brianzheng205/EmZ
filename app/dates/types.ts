type Commute = "Public Transport" | "Uber" | "Walk";

export type ActivityType = "Prepare" | "Bulk" | "Fun" | Commute | "Other" | "";

/*****************/
/* BACKEND TYPES */
/*****************/

// DATES LIST

export type FirestoreListItem = {
  name: string;
  placeId: string;
  duration: number;
  cost: number;
  activityType: ActivityType;
  notes: string;
};

export type FirestoreIdToListItem = Record<string, FirestoreListItem>;

// DATES PLANNER

export type FirestorePlannerItem = {
  startTime: string;
  startTimeFixed: boolean;
  duration: number;
  placeId: string;
  activity: string;
  activityType: ActivityType;
  notes: string;
};

export type FirestorePlannerMetadata = {
  name: string;
  date: string;
};

export type FirestoreDate = FirestorePlannerMetadata & {
  schedule: FirestorePlannerItem[];
};

export type FirestoreIdToPlannerDate = Record<string, FirestoreDate>;

/******************/
/* FRONTEND TYPES */
/******************/

// DATES LIST

export type ListRow = FirestoreListItem & {
  id: string;
};

// DATES PLANNER

export type PlannerItem = Omit<FirestorePlannerItem, "startTime"> & {
  startTime: Date;
};

export type PlannerMetadata = Omit<FirestorePlannerMetadata, "date"> & {
  date: Date;
};

export type PlannerDate = PlannerMetadata & {
  schedule: PlannerItem[];
};

export type IdToPlannerDate = { [id: string]: PlannerDate };

export type PlannerRow = PlannerItem & {
  id: number;
};

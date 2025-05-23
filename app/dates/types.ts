type Commute = "Public Transport" | "Uber" | "Walk";

export type ActvityType = "Prepare" | "Bulk" | "Fun" | Commute | "Other" | "";

/*****************/
/* BACKEND TYPES */
/*****************/

// DATES PLANNER

export type FirestorePlannerItem = {
  startTime: string;
  startTimeFixed: boolean;
  duration: number;
  activity: string;
  activityType: ActvityType;
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

// DATES LIST

export type FirestoreListItem = {
  name: string;
  placeId: string;
  duration: number;
  cost: number;
  activityType: ActvityType;
  notes: string;
};

export type FirestoreIdToListItem = Record<string, FirestoreListItem>;

/******************/
/* FRONTEND TYPES */
/******************/

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

// DATES LIST

export type ListItem = FirestoreListItem & {
  id: number;
};

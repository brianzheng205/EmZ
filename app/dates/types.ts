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

export type FirestoreListItemWithPlace = Omit<FirestoreListItem, "placeId"> & {
  place: google.maps.places.Place | null;
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

export type ListRowWithPlaces = Omit<ListRow, "placeId"> & {
  place: google.maps.places.Place | null;
};

// DATES PLANNER

export type PlannerItem = Omit<FirestorePlannerItem, "startTime"> & {
  startTime: Date;
};

export type PlannerItemWithPlace = Omit<PlannerItem, "placeId"> & {
  place: google.maps.places.Place | null;
};

export type PlannerMetadata = Omit<FirestorePlannerMetadata, "date"> & {
  date: Date;
};

export type PlannerDate = PlannerMetadata & {
  schedule: PlannerItem[];
};

export type PlannerDateWithPlaces = Omit<PlannerDate, "schedule"> & {
  schedule: PlannerItemWithPlace[];
};

export type IdToPlannerDate = { [id: string]: PlannerDate };

export type IdToPlannerDateWithPlaces = {
  [id: string]: PlannerDateWithPlaces;
};

export type PlannerRow = PlannerItem & {
  id: number;
};

export type PlannerRowWithPlace = Omit<PlannerRow, "placeId"> & {
  place: google.maps.places.Place | null;
};

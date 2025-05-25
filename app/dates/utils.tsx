import { ArrowDropDown, Delete } from "@mui/icons-material";
import { Button, Chip } from "@mui/material";
import { GridColDef, GridValidRowModel } from "@mui/x-data-grid";
import * as R from "ramda";

import { ActivityType, PlannerRowWithPlace, ListRowWithPlaces } from "./types";

export const getCommonColumns = (
  handleDeleteRow: (row: GridValidRowModel) => void
) => ({
  name: {
    field: "name",
    headerName: "Name",
    type: "string",
    editable: true,
    flex: 1,
  } as GridColDef,
  duration: {
    field: "duration",
    headerName: "Duration",
    type: "number",
    headerAlign: "left",
    editable: true,
    width: 100,
    valueFormatter: convertNumberTo24HourFormat,
  } as GridColDef,
  cost: {
    field: "cost",
    headerName: "Cost",
    headerAlign: "left",
    type: "number",
    editable: true,
    width: 100,
    valueFormatter: (value: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value),
  } as GridColDef,
  location: {
    field: "place",
    headerName: "Location",
    type: "string",
    width: 200,
    valueGetter: (value: google.maps.places.Place | null) =>
      value ? value.formattedAddress : "",
  } as GridColDef,
  activityType: {
    field: "activityType",
    headerName: "Type",
    type: "singleSelect",
    width: 100,
    editable: true,
    valueOptions: [
      "Prepare",
      "Bulk",
      "Fun",
      "Public Transport",
      "Uber",
      "Walk",
      "Other",
    ] as ActivityType[],
    renderCell: (params) => {
      if (params.value === "") return null;

      const colorMap = {
        Fun: "primary",
        Bulk: "success",
        "Public Transport": "warning",
        Uber: "warning",
        Walk: "warning",
        Prepare: "info",
        Other: "info",
      };

      return (
        <Chip
          label={params.value}
          color={colorMap[params.value] || "default"}
          size="small"
          // TODO: MAKE THIS APPEAR
          deleteIcon={<ArrowDropDown />}
        />
      );
    },
  } as GridColDef,
  notes: {
    field: "notes",
    headerName: "Notes",
    type: "string",
    editable: true,
    flex: 1,
  } as GridColDef,
  delete: {
    field: "delete",
    headerName: "",
    sortable: false,
    width: 50,
    renderCell: (params) => (
      <Button
        sx={{
          minWidth: 0,
          padding: 0,
        }}
        variant="text"
        onClick={() => handleDeleteRow(params.row)}
      >
        <Delete />
      </Button>
    ),
  } as GridColDef,
});

/**
 * Converts a Date object to a string in the format "MM/DD/YYYY".
 */
export const convertDateToDateStr = (date: Date): string =>
  `${date.toLocaleString("en-US", {
    month: "numeric",
  })}/${date.toLocaleString("en-US", {
    day: "numeric",
  })}/${date.toLocaleString("en-US", { year: "numeric" })}`;

/**
 * Converts a string in the format "MM/DD/YYYY" to a Date object.
 */
export const convertDateStrToDate = (dateString: string): Date => {
  const [month, day, year] = dateString.split("/").map(Number);
  return new Date(year, month - 1, day);
};

/**
 * @param time in 24-hour format (e.g., "14:30")
 * @returns Date object with the time set
 */
export const convertTimeStrToDate = (time: string): Date => {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  return date;
};

/**
 * @param date Date object
 * @returns string in 24-hour format (e.g., "14:30")
 */
export const convertDateToTimeStr = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

/**
 * Returns duration in minutes between two Dates.
 */
const calculateDuration = (start: Date, end: Date) => {
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60));
};

export const addMinutes = (date: Date, minutes: number): Date =>
  new Date(date.getTime() + minutes * 60 * 1000);

export const convertNumberTo24HourFormat = (number: number): string => {
  const hours = Math.floor(number / 60);
  const minutes = number % 60;
  return hours > 0
    ? `${hours.toString()}:${minutes.toString().padStart(2, "0")}`
    : minutes.toString();
};

/**
 * Returns the next available ID for a new row.
 */
export const getNextAvailableId = (rows: PlannerRowWithPlace[]): number => {
  const ids = new Set(rows.map((row) => row.id));
  let nextId = 1;
  while (ids.has(nextId)) {
    nextId++;
  }
  return nextId;
};

/**
 * Recalculates the start times and durations of planner rows and
 * edits the rows in place.
 *
 * @returns true if all rows are valid, false if any row has an invalid duration.
 */
export const recalculateRows = (rows: PlannerRowWithPlace[]): boolean => {
  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1];
    const curr = rows[i];

    if (curr.startTimeFixed) {
      // Duration of previous row = curr.startTime - prev.startTime
      const prevDuration = calculateDuration(prev.startTime, curr.startTime);
      if (prevDuration < 0) return false; // Invalid duration
      prev.duration = prevDuration;
    } else {
      // Flexible: curr.startTime = prev.startTime + prev.duration
      curr.startTime = addMinutes(prev.startTime, prev.duration);
    }
  }

  return true;
};

// DATE LIST

export const isValidListItem = (
  list: ListRowWithPlaces[],
  item: ListRowWithPlaces,
  silent = false
): boolean => {
  if (R.isEmpty(item.name) || item.duration <= 0) {
    if (!silent)
      console.error("Invalid item: name is empty or duration is non-positive");
    return false;
  }

  for (let i = 0; i < list.length; i++) {
    if (list[i].name === item.name && list[i].place?.id === item.place?.id) {
      if (!silent)
        console.error(
          "Invalid item: name and placeId already exist in the list"
        );
      return false;
    }
  }

  return true;
};

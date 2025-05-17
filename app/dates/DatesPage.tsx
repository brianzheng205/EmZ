"use client";

import { ArrowDropDown } from "@mui/icons-material";
import { Container, Chip } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderEditCellParams,
} from "@mui/x-data-grid";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { useState, useCallback } from "react";

import { ActvityType, Row } from "./types";
import {
  convertTo12HourFormat,
  convertToDate,
  convertTo24HourFormat,
} from "./utls";

function StartTimePicker(params: GridRenderEditCellParams) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TimePicker
        value={params.value ? convertToDate(params.value) : new Date()}
        onChange={(newDate) => {
          if (!newDate) return;

          const updatedDate = convertTo24HourFormat(newDate);

          params.api.setEditCellValue({
            id: params.id,
            field: params.field,
            value: updatedDate,
          });
        }}
      />
    </LocalizationProvider>
  );
}

const columns: GridColDef[] = [
  {
    field: "startTime",
    headerName: "Start Time",
    headerAlign: "left",
    align: "left",
    width: 150,
    editable: true,
    type: "string",
    valueFormatter: (value: string) =>
      value !== "" ? convertTo12HourFormat(value) : "",
    renderEditCell: StartTimePicker,
  },
  {
    field: "duration",
    headerName: "Duration",
    type: "number",
    headerAlign: "left",
    align: "left",
    editable: true,
    flex: 1,
  },
  {
    field: "activity",
    headerName: "Activity",
    type: "string",
    editable: true,
    flex: 2,
  },
  {
    field: "type",
    headerName: "Type",
    type: "singleSelect",
    flex: 1,
    editable: true,
    valueOptions: ["Work", "Personal", "Other"] as ActvityType[],
    renderCell: (params) => {
      const colorMap = {
        Work: "primary",
        Exercise: "success",
        Personal: "warning",
      };

      return (
        <Chip
          label={params.value}
          color={colorMap[params.value] || "default"}
          size="small"
          // TODO: make this appear
          deleteIcon={<ArrowDropDown />}
        />
      );
    },
  },
  {
    field: "notes",
    headerName: "Notes",
    type: "string",
    editable: true,
    flex: 3,
  },
];

const emptyRow: Row = {
  id: -1,
  startTime: "",
  duration: 0,
  activity: "",
  type: "",
  notes: "",
};
let nextId = 2;

export default function DatesPage() {
  const [rows, setRows] = useState<Row[]>([
    {
      id: 1,
      startTime: "10:00",
      duration: 60,
      activity: "Meeting",
      type: "Work",
      notes: "Meeting with client",
    },
    { ...emptyRow },
  ]);

  console.log(
    "Rows",
    rows.map((row) => row.startTime)
  );

  const processRowUpdate = useCallback((newRow: Row) => {
    if (newRow.id === emptyRow.id) {
      // Promote to real row and append another empty row
      const newId = nextId++;
      setRows((prev) => [
        ...prev.slice(0, -1),
        { ...newRow, id: newId },
        { ...emptyRow, startTime: newRow.startTime },
      ]);
    } else {
      // Just update existing row
      setRows((prev) =>
        prev.map((row) => (row.id === newRow.id ? newRow : row))
      );
    }

    return newRow;
  }, []);

  return (
    <Container>
      <DataGrid
        rows={rows}
        columns={columns}
        processRowUpdate={processRowUpdate}
        disableColumnResize
        disableAutosize
        disableColumnSorting
        disableColumnMenu
        hideFooter
      />
    </Container>
  );
}

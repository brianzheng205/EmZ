"use client";

import { ArrowDropDown, Delete } from "@mui/icons-material";
import { Container, Chip, Button } from "@mui/material";
import { Theme, styled, darken } from "@mui/material/styles";
import {
  DataGrid,
  GridColDef,
  GridRenderEditCellParams,
} from "@mui/x-data-grid";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { useState } from "react";

import { ActvityType, Row } from "./types";
import {
  convert24To12HourFormat,
  convertToDate,
  convertDateTo24HourFormat,
  convertNumberTo24HourFormat,
  getNextAvailableId,
  recalculateRows,
} from "./utils";

function StartTimePicker(params: GridRenderEditCellParams) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TimePicker
        value={params.value ? convertToDate(params.value) : new Date()}
        onChange={(newDate) => {
          if (!newDate) return;

          const updatedDate = convertDateTo24HourFormat(newDate);

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

const StyledDataGrid = styled(DataGrid)(({ theme }: { theme: Theme }) => ({
  "& .fixed": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    "&:hover": {
      backgroundColor: darken(theme.palette.primary.main, 0.1),
    },
    "&.Mui-selected": {
      backgroundColor: theme.palette.primary.main,
      "&:hover": {
        backgroundColor: darken(theme.palette.primary.main, 0.1),
      },
    },
  },
}));

const lastRow: Row = {
  id: -1,
  startTime: "",
  duration: 0,
  activity: "",
  type: "",
  notes: "",
  startTimeType: "calculated",
};

const initialRows: Row[] = [
  {
    id: 1,
    startTime: "10:00",
    duration: 0,
    activity: "Get Ready",
    type: "Prepare",
    notes: "",
    startTimeType: "fixed",
  },
  { ...lastRow, startTime: "10:00", id: 2 },
];

export default function DatesPage() {
  const [rows, setRows] = useState(initialRows);

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
        value !== "" ? convert24To12HourFormat(value) : "",
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
      valueFormatter: convertNumberTo24HourFormat,
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
      valueOptions: ["Prepare", "Bulk", "Fun", "Other"] as ActvityType[],
      renderCell: (params) => {
        const colorMap = {
          Prepare: "primary",
          Bulk: "success",
          Fun: "warning",
          Other: "error",
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
    {
      field: "delete",
      headerName: "",
      sortable: false,
      width: 50,
      renderCell: (params) =>
        params.row.id !== rows[0].id &&
        params.row.id !== rows[rows.length - 1].id && (
          <Button
            variant="text"
            onClick={() => handleDeleteRow(params.row)}
            sx={{ minWidth: 0, padding: 0 }}
          >
            <Delete />
          </Button>
        ),
    },
  ];

  const handleDeleteRow = (row: Row) => {
    const updatedRows = rows.filter((r) => r.id !== row.id);
    const isValid = recalculateRows(updatedRows);
    if (!isValid) return;
    setRows(updatedRows);
  };

  const processRowUpdate = (newRow: Row, oldRow: Row) => {
    const updatedRows = [...rows];
    const idx = updatedRows.findIndex((r) => r.id === newRow.id);

    // If editing the last row, add a new row
    if (newRow.id === rows[rows.length - 1].id) {
      updatedRows[idx] = { ...newRow };
      updatedRows.push({ ...lastRow, id: getNextAvailableId(updatedRows) });
    }

    // Update the row
    updatedRows[idx] = { ...updatedRows[idx], ...newRow };

    if (
      // 1. If editing startTime of a calculated row, convert it to fixed
      newRow.startTime !== oldRow.startTime &&
      oldRow.startTimeType === "calculated"
    ) {
      updatedRows[idx].startTimeType = "fixed";
    } else if (
      // 2. If editing duration of a row before a fixed row, convert next row to calculated
      newRow.duration !== oldRow.duration &&
      newRow.id < updatedRows.length && // not last (empty) row
      updatedRows[idx + 1].startTimeType === "fixed"
    ) {
      updatedRows[idx + 1].startTimeType = "calculated";
    }

    // Always enforce: first row is fixed, last (empty) row is calculated
    if (updatedRows.length > 1) {
      updatedRows[0].startTimeType = "fixed";
      updatedRows[updatedRows.length - 1].startTimeType = "calculated";
    }

    // Recalculate startTimes/durations as needed
    const isValid = recalculateRows(updatedRows);
    if (!isValid) return oldRow;

    setRows(updatedRows);
    return updatedRows[idx];
  };

  return (
    <Container>
      <StyledDataGrid
        rows={rows}
        columns={columns}
        processRowUpdate={processRowUpdate}
        disableColumnResize
        disableAutosize
        disableColumnSorting
        disableColumnMenu
        hideFooter
        getRowClassName={(params) => params.row.startTimeType}
      />
    </Container>
  );
}

"use client";

import { Add, Refresh } from "@mui/icons-material";
import { Box, Stack, Button } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import * as R from "ramda";
import React from "react";

import { updateDateListItem, deleteDateListItem } from "../firebaseUtils";
import { ListRowWithPlaces } from "../types";
import { getCommonColumns, isValidListItem } from "../utils";

interface DateListProps {
  rows: ListRowWithPlaces[];
  setRows: React.Dispatch<React.SetStateAction<ListRowWithPlaces[]>>;
  onAdd: () => void;
  onRefresh: () => void;
}

export default function DateList({
  rows,
  setRows,
  onAdd,
  onRefresh,
}: DateListProps) {
  const processRowUpdate = async (
    newRow: ListRowWithPlaces,
    oldRow: ListRowWithPlaces
  ) => {
    if (R.equals(newRow, oldRow)) return newRow;

    const row = rows.find((row) => row.id === newRow.id);
    if (R.isNil(row)) {
      console.error("Row not found");
      return oldRow;
    }

    const isValid = isValidListItem(
      rows.filter((r) => r.id !== row.id),
      row
    );
    if (!isValid) return oldRow;

    try {
      await updateDateListItem(newRow);
      setRows((prevRows) =>
        prevRows.map((row) => (row.id === newRow.id ? newRow : row))
      );
      return newRow;
    } catch (error) {
      console.error("Error updating row:", error);
      return oldRow;
    }
  };

  const onProcessRowUpdateError = (error) => {
    console.error("Error processing row update:", error);
  };

  const handleDeleteRow = async (row: ListRowWithPlaces) => {
    try {
      await deleteDateListItem(row.id);
      setRows((prevRows) => prevRows.filter((r) => r.id !== row.id));
    } catch (error) {
      console.error("Error deleting row:", error);
    }
  };

  const commonColumns = getCommonColumns(handleDeleteRow);
  const columns: GridColDef[] = [
    commonColumns.name,
    commonColumns.location,
    commonColumns.duration,
    commonColumns.cost,
    commonColumns.activityType,
    commonColumns.notes,
    commonColumns.delete,
  ];

  return (
    <>
      <Stack
        sx={{
          flexDirection: "row",
          justifyContent: "flex-end",
          gap: 1,
          height: 36,
        }}
      >
        <Button startIcon={<Add />} onClick={onAdd}>
          Add
        </Button>
        <Button startIcon={<Refresh />} onClick={onRefresh}>
          Refresh
        </Button>
      </Stack>

      <Box>
        <DataGrid
          rows={rows}
          columns={columns}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={onProcessRowUpdateError}
          showToolbar
          hideFooter
        />
      </Box>
    </>
  );
}

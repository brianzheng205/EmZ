"use client";

import { Add, Refresh } from "@mui/icons-material";
import { Box, Stack, Button } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import * as R from "ramda";
import { useState, useEffect } from "react";

import CenteredLoader from "@/components/CenteredLoader";
import useDialog from "@/hooks/useDialog";

import DateItemDialog from "../dialogs/DateItemDialog";
import {
  fetchDateList,
  createDateListItem,
  updateDateListItem,
  deleteDateListItem,
} from "../firebaseUtils";
import { FirestoreListItem, ListRow } from "../types";
import { getCommonColumns, isValidListItem } from "../utils";

export default function DatePlanner() {
  const [rows, setRows] = useState<ListRow[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    isDialogOpen: isAddListItemDialogOpen,
    openDialog: openAddListItemDialog,
    closeDialog: closeAddListItemDialog,
  } = useDialog();

  const fetchData = async () => {
    setLoading(true);
    const fetchedRows = await fetchDateList();
    setRows(fetchedRows);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddRow = async (newListItem: FirestoreListItem) => {
    const newId = await createDateListItem(newListItem);

    if (R.isNil(newId)) return;

    const newRow: ListRow = {
      ...newListItem,
      id: newId,
    };
    setRows((prevRows) => [...prevRows, newRow]);
  };

  const processRowUpdate = async (newRow: ListRow, oldRow: ListRow) => {
    if (R.equals(newRow, oldRow)) return newRow;

    const row = rows.find((row) => row.id === newRow.id);
    if (R.isNil(row)) {
      console.error("Row not found");
      return oldRow;
    }

    const isValid = isValidListItem(rows, row);
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

  const handleDeleteRow = async (row: ListRow) => {
    try {
      await deleteDateListItem(row.id);
      setRows((prevRows) => prevRows.filter((r) => r.id !== row.id));
    } catch (error) {
      console.error("Error deleting row:", error);
    }
  };

  const onProcessRowUpdateError = (error) => {
    console.error("Error processing row update:", error);
  };

  const commonColumns = getCommonColumns(handleDeleteRow);
  const columns: GridColDef[] = [
    commonColumns.name,
    commonColumns.duration,
    commonColumns.cost,
    commonColumns.activityType,
    commonColumns.notes,
    commonColumns.delete,
  ];

  if (loading) return <CenteredLoader />;

  return (
    <>
      <Stack sx={{ flexDirection: "row", justifyContent: "flex-end", gap: 1 }}>
        <Button startIcon={<Add />} onClick={openAddListItemDialog}>
          Add
        </Button>
        <Button startIcon={<Refresh />} onClick={fetchData}>
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

      <DateItemDialog
        open={isAddListItemDialogOpen}
        onClose={closeAddListItemDialog}
        onSubmit={handleAddRow}
        title="Add Date Item"
        submitText="Add"
        dateListItems={rows}
      />
    </>
  );
}

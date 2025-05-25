"use client";

import { Add, Refresh } from "@mui/icons-material";
import { Box, Stack, Button } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { ListRow } from "../types";

interface DateListProps {
  rows: ListRow[];
  columns: GridColDef[];
  processRowUpdate: (newRow: ListRow, oldRow: ListRow) => Promise<ListRow>;
  onProcessRowUpdateError: (error: Error) => void;
  openAddListItemDialog: () => void;
  fetchData: () => void;
}

export default function DateList({
  rows,
  columns,
  processRowUpdate,
  onProcessRowUpdateError,
  openAddListItemDialog,
  fetchData,
}: DateListProps) {
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
    </>
  );
}

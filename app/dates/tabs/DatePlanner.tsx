"use client";

import { Delete, Edit, Refresh } from "@mui/icons-material";
import { Button, Box, Select, MenuItem, Stack } from "@mui/material";
import { Theme, styled, darken } from "@mui/material/styles";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DocumentReference, doc } from "firebase/firestore";
import * as R from "ramda";
import { useEffect } from "react";

import {
  TimePickerEditCell,
  AutocompleteEditCell,
} from "@/components/dataGrid";
import useDialog from "@/hooks/useDialog";
import db from "@firebase";

import { AddDateDialog, EditDateDialog } from "../dialogs";
import {
  createDate,
  updateActiveDate,
  updateDateSchedule,
  updateDateMetadata,
  deleteDate,
} from "../firebaseUtils";
import {
  ListRow,
  PlannerRow,
  IdToPlannerDate,
  PlannerDate,
  PlannerItem,
  PlannerMetadata,
} from "../types";
import {
  getCommonColumns,
  getNextAvailableId,
  recalculateRows,
  addMinutes,
  convertDateToDateStr,
} from "../utils";

interface DateSelectorProps {
  docRef: DocumentReference | null;
  setDocRef: React.Dispatch<React.SetStateAction<DocumentReference | null>>;
  dates: IdToPlannerDate | null;
  onAdd: (metadata: PlannerMetadata) => void;
  onDelete: (docRef: DocumentReference) => void;
}

function DateSelector({
  docRef,
  setDocRef,
  dates,
  onAdd,
  onDelete,
}: DateSelectorProps) {
  const {
    isDialogOpen: isAddDateDialogOpen,
    openDialog: openAddDateDialog,
    closeDialog: closeAddDateDialog,
  } = useDialog();

  const convertToDisplayValue = (date: PlannerDate) =>
    `${convertDateToDateStr(date.date)}${
      date.name !== "" ? ` - ${date.name}` : ""
    }`;

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Select
        sx={{ width: 200, height: "100%" }}
        value={docRef ? docRef.id : ""}
        displayEmpty
        margin="dense"
        renderValue={(selectedId) =>
          dates?.[selectedId]
            ? convertToDisplayValue(dates[selectedId])
            : "+ New date"
        }
      >
        <MenuItem value="add-new" onClick={openAddDateDialog}>
          + New date
        </MenuItem>

        {dates &&
          R.pipe(
            R.toPairs,
            R.sortBy(([, d]: [string, PlannerDate]) => d.date), // Sort by date
            R.map(([dateId, date]: [string, PlannerDate]) => (
              <MenuItem
                key={dateId}
                value={dateId}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  width: 200,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (R.isNil(docRef) || dateId !== docRef.id) {
                    setDocRef(doc(db, "dates", dateId));
                  }
                }}
              >
                <Box
                  sx={{
                    width: 160,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {convertToDisplayValue(date)}
                </Box>
                <Button
                  sx={{
                    width: 40,
                    minWidth: 0,
                    padding: 0.5,
                    margin: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  variant="text"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(doc(db, "dates", dateId));
                  }}
                  disabled={R.isNotNil(docRef) && dateId === docRef.id}
                >
                  <Delete fontSize="small" />
                </Button>
              </MenuItem>
            ))
          )(dates)}
      </Select>
      {dates && (
        <AddDateDialog
          open={isAddDateDialogOpen}
          dates={dates}
          onClose={closeAddDateDialog}
          onSubmit={onAdd}
        />
      )}
    </Box>
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

const lastRow: PlannerItem = {
  startTime: new Date(),
  duration: 0,
  placeId: "",
  activity: "",
  activityType: "",
  notes: "",
  startTimeFixed: false,
};

interface DatesPlannerProps {
  dateList: ListRow[];
  dates: IdToPlannerDate;
  setDates: React.Dispatch<React.SetStateAction<IdToPlannerDate>>;
  activeDateRef: DocumentReference | null;
  setActiveDateRef: React.Dispatch<
    React.SetStateAction<DocumentReference | null>
  >;
  rows: PlannerRow[];
  onRefresh: () => void;
  setRows: React.Dispatch<React.SetStateAction<PlannerRow[]>>;
}

export default function DatesPlanner({
  dateList,
  dates,
  setDates,
  activeDateRef,
  setActiveDateRef,
  rows,
  setRows,
  onRefresh,
}: DatesPlannerProps) {
  const {
    isDialogOpen: isEditDateDialogOpen,
    openDialog: openEditDateDialog,
    closeDialog: closeEditDateDialog,
  } = useDialog();

  useEffect(() => {
    if (!activeDateRef) return;

    const activeDate = dates[activeDateRef.id];
    if (!activeDate) return;

    const schedule = activeDate.schedule.map((item, index) => ({
      ...item,
      id: index,
    }));
    schedule.push({
      ...lastRow,
      id: getNextAvailableId(schedule),
      startTime: addMinutes(
        schedule[schedule.length - 1].startTime,
        schedule[schedule.length - 1].duration
      ),
    });
    setRows(schedule);
  }, [dates, activeDateRef, setRows]);

  const handleDeleteRow = async (row: PlannerRow) => {
    if (!activeDateRef) return;

    const updatedRows = rows.filter((r) => r.id !== row.id);
    const isValid = recalculateRows(updatedRows);
    if (!isValid) return;

    await updateDateSchedule(activeDateRef, updatedRows);
    setRows(updatedRows);
  };

  const commonColumns = getCommonColumns(handleDeleteRow);

  const columns: GridColDef[] = [
    {
      field: "startTime",
      headerName: "Start Time",
      headerAlign: "left",
      align: "left",
      width: 150,
      editable: true,
      type: "dateTime",
      valueFormatter: (value: Date) =>
        value.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      renderEditCell: TimePickerEditCell,
    },
    commonColumns.duration,
    {
      ...commonColumns.name,
      field: "activity",
      headerName: "Activity",
      renderEditCell: (params) => (
        <AutocompleteEditCell
          params={params}
          options={dateList.map((l) => ({ label: l.name, value: l.id }))}
          handleSelect={async (value: string) => {
            if (!activeDateRef) return;

            const selectedItem = dateList.find((l) => l.id === value);
            if (!selectedItem) return;

            const newRows = rows.map((row) =>
              row.id === params.row.id
                ? {
                    ...row,
                    duration: selectedItem.duration,
                    placeId: selectedItem.id,
                    activity: selectedItem.name,
                    activityType: selectedItem.activityType,
                    notes: selectedItem.notes,
                  }
                : row
            );

            const isValid = recalculateRows(newRows);
            if (!isValid) return;

            await updateDateSchedule(activeDateRef, newRows);
            setRows(newRows);
          }}
        />
      ),
    },
    commonColumns.activityType,
    commonColumns.notes,
    {
      ...commonColumns.delete,
      renderCell: (params) => {
        const row = params.row as PlannerRow;

        return row.id !== rows[0].id && row.id !== rows[rows.length - 1].id ? (
          <Button
            sx={{
              color: row.startTimeFixed ? "secondary.main" : "primary.main",
              minWidth: 0,
              padding: 0,
            }}
            variant="text"
            onClick={() => handleDeleteRow(params.row)}
          >
            <Delete />
          </Button>
        ) : null;
      },
    },
  ];

  const processRowUpdate = async (newRow: PlannerRow, oldRow: PlannerRow) => {
    if (!activeDateRef || R.equals(newRow, oldRow)) return oldRow;

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
      // 1. If editing startTime of a not fixed row, convert it to fixed
      newRow.startTime !== oldRow.startTime &&
      !oldRow.startTimeFixed
    ) {
      updatedRows[idx].startTimeFixed = true;
    } else if (
      // 2. If editing duration of a row before a fixed row, convert next row to not fixed
      newRow.duration !== oldRow.duration &&
      newRow.id < updatedRows.length && // not last (empty) row
      updatedRows[idx + 1].startTimeFixed
    ) {
      updatedRows[idx + 1].startTimeFixed = false;
    }

    // Always enforce: first row is fixed, last (empty) row is not fixed
    if (updatedRows.length > 1) {
      updatedRows[0].startTimeFixed = true;
      updatedRows[updatedRows.length - 1].startTimeFixed = false;
    }

    // Recalculate startTimes/durations as needed
    const isValid = recalculateRows(updatedRows);
    if (!isValid) return oldRow;

    await updateDateSchedule(activeDateRef, updatedRows);
    setRows(updatedRows);
    return updatedRows[idx];
  };

  const setDocRef = async (docRef: DocumentReference) => {
    try {
      await updateActiveDate(docRef);
      setActiveDateRef(docRef);
    } catch {}
  };

  const handleAddDate = async (metadata: PlannerMetadata) => {
    try {
      const newDateCreation = await createDate(metadata);
      if (!newDateCreation) return;
      const [dateRef, date] = newDateCreation;
      await updateActiveDate(dateRef);

      setDates((prev) => ({
        ...prev,
        [dateRef.id]: date,
      }));
      setActiveDateRef(dateRef);
    } catch {}
  };

  const handleDeleteDate = async (docRef: DocumentReference) => {
    try {
      await deleteDate(docRef);
      setDates((prev) => R.dissoc(docRef.id, prev));
      if (activeDateRef?.id === docRef.id) {
        setActiveDateRef(null);
      }
    } catch {}
  };

  const handleEditDate = async (metadata: PlannerMetadata) => {
    if (!activeDateRef) return;

    try {
      await updateDateMetadata(activeDateRef.id, metadata);
      setDates((prev) =>
        R.assoc(
          activeDateRef.id,
          R.mergeRight(prev[activeDateRef.id], metadata),
          prev
        )
      );
    } catch {}
  };

  return (
    <>
      <Stack
        sx={{
          flexDirection: "row",
          justifyContent: "space-between",
          height: 36,
        }}
      >
        <DateSelector
          docRef={activeDateRef}
          setDocRef={setDocRef}
          dates={dates}
          onAdd={handleAddDate}
          onDelete={handleDeleteDate}
        />

        <Stack
          sx={{
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 1,
          }}
        >
          <Button startIcon={<Edit />} onClick={openEditDateDialog}>
            Edit
          </Button>
          <Button startIcon={<Refresh />} onClick={onRefresh}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      <Box>
        <StyledDataGrid
          rows={rows}
          columns={columns}
          processRowUpdate={processRowUpdate}
          getRowClassName={(params) => {
            const row: PlannerRow = params.row as PlannerRow;
            return row.startTimeFixed ? "fixed" : "";
          }}
          disableColumnResize
          disableAutosize
          disableColumnSorting
          disableColumnMenu
          hideFooter
        />
      </Box>

      {activeDateRef && (
        <EditDateDialog
          open={isEditDateDialogOpen}
          onClose={closeEditDateDialog}
          onSubmit={handleEditDate}
          dates={dates}
          initialMetadata={dates[activeDateRef.id]}
        />
      )}
    </>
  );
}

"use client";

import { Delete, Edit, Refresh } from "@mui/icons-material";
import { Button, Box, Stack } from "@mui/material";
import { Theme, styled, darken } from "@mui/material/styles";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DocumentReference } from "firebase/firestore";
import * as R from "ramda";
import { useEffect } from "react";

import {
  TimePickerEditCell,
  AutocompleteEditCell,
} from "@/components/dataGrid";
import { getPlaceFromId } from "@/components/maps/utils";
import useDialog from "@/hooks/useDialog";

import DateSelector from "../DateSelector";
import { EditDateDialog } from "../dialogs";

import {
  createDate,
  updateActiveDate,
  updateDateSchedule,
  updateDateMetadata,
  deleteDate,
} from "../../firebaseUtils";
import {
  ListRowWithPlaces,
  PlannerRowWithPlace,
  IdToPlannerDateWithPlaces,
  PlannerItemWithPlace,
  PlannerMetadata,
} from "../../types";
import {
  getCommonColumns,
  getNextAvailableId,
  recalculateRows,
  addMinutes,
} from "../../utils";

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

const lastRow: PlannerItemWithPlace = {
  startTime: new Date(),
  duration: 0,
  place: null,
  activity: "",
  activityType: "",
  notes: "",
  startTimeFixed: false,
};

interface DatesPlannerProps {
  dateList: ListRowWithPlaces[];
  dates: IdToPlannerDateWithPlaces;
  setDates: React.Dispatch<React.SetStateAction<IdToPlannerDateWithPlaces>>;
  activeDateRef: DocumentReference | null;
  setActiveDateRef: React.Dispatch<
    React.SetStateAction<DocumentReference | null>
  >;
  rows: PlannerRowWithPlace[];
  onRefresh: () => void;
  setRows: React.Dispatch<React.SetStateAction<PlannerRowWithPlace[]>>;
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

  const handleDeleteRow = async (row: PlannerRowWithPlace) => {
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

            const newRows: PlannerRowWithPlace[] = rows.map((row) =>
              row.id === params.row.id
                ? ({
                    ...row,
                    duration: selectedItem.duration,
                    place: selectedItem.place,
                    activity: selectedItem.name,
                    activityType: selectedItem.activityType,
                    notes: selectedItem.notes,
                  } as PlannerRowWithPlace)
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
    commonColumns.location,
    commonColumns.activityType,
    commonColumns.notes,
    {
      ...commonColumns.delete,
      renderCell: (params) => {
        const row = params.row as PlannerRowWithPlace;

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

  const processRowUpdate = async (
    newRow: PlannerRowWithPlace,
    oldRow: PlannerRowWithPlace
  ) => {
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

      const scheduleWithPlaces = await Promise.all(
        date.schedule.map(async (item) => {
          const place = await getPlaceFromId(item.placeId);
          return {
            ...R.dissoc("placeId", item),
            place: place || null,
          } as PlannerItemWithPlace;
        })
      );

      setDates((prev) => ({
        ...prev,
        [dateRef.id]: {
          ...date,
          schedule: scheduleWithPlaces,
        },
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
            const row: PlannerRowWithPlace = params.row as PlannerRowWithPlace;
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

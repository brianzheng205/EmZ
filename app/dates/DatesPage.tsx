"use client";

import { ArrowDropDown, Delete, Edit, Refresh } from "@mui/icons-material";
import {
  Container,
  Chip,
  Button,
  Box,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
} from "@mui/material";
import { Theme, styled, darken } from "@mui/material/styles";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DocumentReference, doc } from "firebase/firestore";
import * as R from "ramda";
import { useState, useEffect } from "react";

import { TimePickerEditCell } from "@/components/dataGrid";
import useDialog from "@/hooks/useDialog";
import db from "@firebase";

import AddDateDialog from "./dialogs/AddDateDialog";
import EditDateDialog from "./dialogs/EditDateDialog";
import {
  fetchAllDates,
  fetchActiveDateRef,
  createDate,
  updateActiveDate,
  updateDateSchedule,
  updateDateMetadata,
  deleteDate,
} from "./firebaseUtils";
import {
  ActvityType,
  Row,
  IdToDate,
  EmZDate,
  ScheduleItem,
  Metadata,
} from "./types";
import {
  convertNumberTo24HourFormat,
  getNextAvailableId,
  recalculateRows,
  addMinutes,
  convertDateToDateStr,
} from "./utils";

interface DateSelectorProps {
  docRef: DocumentReference | null;
  setDocRef: (docRef: DocumentReference) => void;
  dates: IdToDate | null;
  onAdd: (metadata: Metadata) => void;
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

  const convertToDisplayValue = (date: EmZDate) =>
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
            R.sortBy(([, d]: [string, EmZDate]) => d.date), // Sort by date
            R.map(([dateId, date]: [string, EmZDate]) => (
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

const lastRow: ScheduleItem = {
  startTime: new Date(),
  duration: 0,
  activity: "",
  activityType: "",
  notes: "",
  startTimeFixed: false,
};

export default function DatesPage() {
  const [dates, setDates] = useState<IdToDate>({});
  const [activeDateRef, setActiveDateRef] = useState<DocumentReference | null>(
    null
  );
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  // const activeDate: EmZDate = useMemo(
  //   () => (activeDateRef ? dates[activeDateRef.id] : ({} as EmZDate)),
  //   [dates, activeDateRef]
  // );
  const {
    isDialogOpen: isEditDateDialogOpen,
    openDialog: openEditDateDialog,
    closeDialog: closeEditDateDialog,
  } = useDialog();

  const fetchDates = async () => {
    setLoading(true);
    const fetchedDates = await fetchAllDates();
    setDates(fetchedDates);

    const fetchedActiveDateRef = await fetchActiveDateRef();
    setActiveDateRef(fetchedActiveDateRef);

    setLoading(false);
  };

  useEffect(() => {
    fetchDates();
  }, []);

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
  }, [dates, activeDateRef]);

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
      field: "activityType",
      headerName: "Type",
      type: "singleSelect",
      flex: 1,
      editable: true,
      valueOptions: [
        "Prepare",
        "Bulk",
        "Fun",
        "Public Transport",
        "Uber",
        "Walk",
        "Other",
      ] as ActvityType[],
      renderCell: (params) => {
        if (params.value === "") return null;

        const colorMap = {
          Fun: "primary",
          Bulk: "success",
          "Public Transport": "warning",
          Uber: "warning",
          Walk: "warning",
          Prepare: "default",
          Other: "default",
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

  const handleDeleteRow = async (row: Row) => {
    if (!activeDateRef) return;

    const updatedRows = rows.filter((r) => r.id !== row.id);
    const isValid = recalculateRows(updatedRows);
    if (!isValid) return;

    await updateDateSchedule(activeDateRef, updatedRows);
    setRows(updatedRows);
  };

  const processRowUpdate = async (newRow: Row, oldRow: Row) => {
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

  const handleAddDate = async (metadata: Metadata) => {
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

  const handleEditDate = async (metadata: Metadata) => {
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

  if (loading) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Stack sx={{ gap: 1 }}>
        <Stack
          sx={{
            flexDirection: "row",
            justifyContent: "space-between",
            height: 40,
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
              flexDirection: "row-reverse",
              gap: 1,
            }}
          >
            <Button startIcon={<Refresh />} onClick={fetchDates}>
              Refresh
            </Button>
            <Button startIcon={<Edit />} onClick={openEditDateDialog}>
              Edit
            </Button>
          </Stack>
        </Stack>

        <StyledDataGrid
          rows={rows}
          columns={columns}
          processRowUpdate={processRowUpdate}
          getRowClassName={(params) => params.row.startTimeType}
          disableColumnResize
          disableAutosize
          disableColumnSorting
          disableColumnMenu
          hideFooter
        />

        {activeDateRef && (
          <EditDateDialog
            open={isEditDateDialogOpen}
            onClose={closeEditDateDialog}
            onSubmit={handleEditDate}
            dates={dates}
            initialMetadata={dates[activeDateRef.id]}
          />
        )}
      </Stack>
    </Container>
  );
}

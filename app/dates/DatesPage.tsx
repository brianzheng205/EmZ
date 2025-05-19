"use client";

import { ArrowDropDown, Delete } from "@mui/icons-material";
import {
  Container,
  Chip,
  Button,
  Box,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import { Theme, styled, darken } from "@mui/material/styles";
import {
  DataGrid,
  GridColDef,
  GridRenderEditCellParams,
} from "@mui/x-data-grid";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DocumentReference, doc } from "firebase/firestore";
import * as R from "ramda";
import { useState, useEffect } from "react";

import useDialog from "@/hooks/useDialog";
import db from "@firebase";

import AddDateDialog from "./dialogs/AddDateDialog";
import {
  fetchAllDates,
  fetchActiveDateRef,
  updateActiveDate,
  createDate,
  deleteDate,
  updateDateSchedule,
} from "./firebaseUtils";
import {
  ActvityType,
  Row,
  FirebaseIdToDate,
  FirebaseDate,
  FirebaseScheduleItem,
  FirebaseMetadata,
} from "./types";
import {
  convert24To12HourFormat,
  convertToDate,
  convertDateTo24HourFormat,
  convertNumberTo24HourFormat,
  getNextAvailableId,
  recalculateRows,
  addMinutes,
} from "./utils";

interface DateSelectorProps {
  docRef: DocumentReference | null;
  setDocRef: (docRef: DocumentReference) => void;
  dates: FirebaseIdToDate | null;
  onAdd: (metadata: FirebaseMetadata) => void;
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

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Select
        sx={{ width: 200, height: "100%" }}
        value={docRef ? docRef.id : ""}
        displayEmpty
        margin="dense"
        renderValue={(selectedId) =>
          dates?.[selectedId] ? dates[selectedId].name : "+ New date"
        }
      >
        <MenuItem value="add-new" onClick={openAddDateDialog}>
          + New date
        </MenuItem>

        {dates &&
          R.pipe(
            R.mapObjIndexed((date: FirebaseDate, dateId) => (
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
                  {date.name}
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
            )),
            R.values
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

const lastRow: FirebaseScheduleItem = {
  startTime: "",
  duration: 0,
  activity: "",
  activtyType: "",
  notes: "",
  startTimeFixed: false,
};

export default function DatesPage() {
  const [dates, setDates] = useState<FirebaseIdToDate>({});
  const [activeDateRef, setActiveDateRef] = useState<DocumentReference | null>(
    null
  );
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  // const activeDate: FirebaseDate = useMemo(
  //   () => (activeDateRef ? dates[activeDateRef.id] : ({} as FirebaseDate)),
  //   [dates, activeDateRef]
  // );

  useEffect(() => {
    const fetchDates = async () => {
      const fetchedDates = await fetchAllDates();
      setDates(fetchedDates);

      const fetchedActiveDateRef = await fetchActiveDateRef();
      setActiveDateRef(fetchedActiveDateRef);

      setLoading(false);
    };

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

  const handleDeleteRow = async (row: Row) => {
    if (!activeDateRef) return;

    const updatedRows = rows.filter((r) => r.id !== row.id);
    const isValid = recalculateRows(updatedRows);
    if (!isValid) return;

    await updateDateSchedule(activeDateRef, updatedRows);
    setRows(updatedRows);
  };

  const processRowUpdate = async (newRow: Row, oldRow: Row) => {
    if (!activeDateRef) return oldRow;

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
    setActiveDateRef(docRef);
    await updateActiveDate(docRef);
  };

  const handleAddDate = async (metadata: FirebaseMetadata) => {
    const newDate = await createDate(metadata);
    if (!newDate) return;

    setDates((prev) => ({
      ...prev,
      [newDate.id]: newDate.newDate,
    }));
    setActiveDateRef(doc(db, "dates", newDate.id));
  };

  const handleDeleteDate = async (docRef: DocumentReference) => {
    setDates((prev) => R.dissoc(docRef.id, prev));
    if (activeDateRef?.id === docRef.id) {
      setActiveDateRef(null);
    }

    await deleteDate(docRef);
  };

  return (
    <Container>
      <Stack sx={{ gap: 1 }}>
        <Stack sx={{ flexDirection: "row", gap: 1, height: 50 }}>
          <DateSelector
            docRef={activeDateRef}
            setDocRef={setDocRef}
            dates={dates}
            onAdd={handleAddDate}
            onDelete={handleDeleteDate}
          />
        </Stack>

        <StyledDataGrid
          rows={rows}
          columns={columns}
          processRowUpdate={processRowUpdate}
          loading={loading}
          getRowClassName={(params) => params.row.startTimeType}
          disableColumnResize
          disableAutosize
          disableColumnSorting
          disableColumnMenu
          hideFooter
        />
      </Stack>
    </Container>
  );
}

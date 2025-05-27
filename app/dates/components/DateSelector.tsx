import { Delete } from "@mui/icons-material";
import { Box, Button, MenuItem, Select } from "@mui/material";
import { doc, DocumentReference } from "firebase/firestore";
import * as R from "ramda";

import useDialog from "@/hooks/useDialog";
import db from "@firebase";

import {
  IdToPlannerDateWithPlaces,
  PlannerMetadata,
  PlannerDateWithPlaces,
} from "../types";
import { convertDateToDateStr } from "../utils";

import AddDateDialog from "./dialogs/AddDateDialog";

interface DateSelectorProps {
  docRef: DocumentReference | null;
  setDocRef: React.Dispatch<React.SetStateAction<DocumentReference | null>>;
  dates: IdToPlannerDateWithPlaces | null;
  onAdd: (metadata: PlannerMetadata) => void;
  onDelete: (docRef: DocumentReference) => void;
}

export default function DateSelector({
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

  const convertToDisplayValue = (date: PlannerDateWithPlaces) =>
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
            R.sortBy(([, d]: [string, PlannerDateWithPlaces]) => d.date), // Sort by date
            R.map(([dateId, date]: [string, PlannerDateWithPlaces]) => (
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

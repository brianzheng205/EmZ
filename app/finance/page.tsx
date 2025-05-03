"use client";

import { Box } from "@mui/material";
import { styled, Theme, darken } from "@mui/material/styles";
import { DataGrid, GridRowsProp } from "@mui/x-data-grid";
import { DocumentReference } from "firebase/firestore";
import { useEffect, useState } from "react";

import { fetchActiveBudgets, fetchBudget, updateBudget } from "./firebaseUtils";
import {
  Budget,
  BudgetRow,
  combineBudgets,
  getUpdatedBudget,
  getPersonFromColumnHeader,
  COLUMN_HEADERS,
  columns,
  getDataRows,
  getColumnTime,
} from "./utils";

const StyledDataGrid = styled(DataGrid)(({ theme }: { theme: Theme }) => ({
  "& .custom": {
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

export default function Finance() {
  const [emilyDocRef, setEmilyDocRef] = useState<DocumentReference | null>(
    null
  );
  const [brianDocRef, setBrianDocRef] = useState<DocumentReference | null>(
    null
  );
  const [emilyBudget, setEmilyBudget] = useState<Budget>({});
  const [brianBudget, setBrianBudget] = useState<Budget>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [rows, setRows] = useState<GridRowsProp>([]);

  useEffect(() => {
    setLoading(true);

    fetchActiveBudgets().then(async (document) => {
      if (!document) {
        setLoading(false);
        return;
      }

      const emilyB: Budget | null = await fetchBudget(document.emily);
      const brianB: Budget | null = await fetchBudget(document.brian);
      if (!emilyB || !brianB) {
        setLoading(false);
        return;
      }

      const combinedBudget = combineBudgets(emilyB, brianB);
      const dataRows = getDataRows(combinedBudget);

      setEmilyDocRef(document.emily);
      setBrianDocRef(document.brian);
      setEmilyBudget(emilyB);
      setBrianBudget(brianB);
      setRows(dataRows);
      setLoading(false);
    });
  }, []);

  const handleRowUpdate = async (rawNewRow: BudgetRow, oldRow: BudgetRow) => {
    const { category, name, ...newValues } = rawNewRow;
    const { ...oldValues } = oldRow;

    // Determine whose budget changed
    const colChanged = Object.keys(newValues).find(
      (key) => newValues[key] !== oldValues[key]
    );

    if (!colChanged) {
      return rawNewRow; // No changes detected
    }

    const colIndexChanged = COLUMN_HEADERS.indexOf(colChanged);
    const personChanged = getPersonFromColumnHeader(colChanged, "Em", "Z");
    const amount = newValues[colChanged];
    const time = getColumnTime(colIndexChanged);

    if (personChanged === "Em" && emilyDocRef) {
      // Update Emily's budget
      const newBudget = getUpdatedBudget(
        emilyBudget,
        category,
        name,
        amount,
        time
      );
      setEmilyBudget(newBudget);
      updateBudget(emilyDocRef, category, name, amount, time);
      const newRows = getDataRows(combineBudgets(newBudget, brianBudget));
      setRows(newRows);
      return newRows.find((row) => row.id === rawNewRow.id) || rawNewRow;
    } else if (personChanged === "Z" && brianDocRef) {
      // Update Brian's budget
      const newBudget = getUpdatedBudget(
        brianBudget,
        category,
        name,
        amount,
        time
      );
      setBrianBudget(newBudget);
      updateBudget(brianDocRef, category, name, amount, time);
      const newRows = getDataRows(combineBudgets(emilyBudget, newBudget));
      setRows(newRows);
      return newRows.find((row) => row.id === rawNewRow.id) || rawNewRow;
    }

    return rawNewRow;
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        padding: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "90%",
        }}
      >
        <StyledDataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          rowHeight={30}
          hideFooterPagination={rows.length <= 25}
          getRowClassName={(params) => {
            if (
              ["savings", "take-home", "gross-total"].includes(
                params.id as string
              )
            )
              return "custom";
            return "";
          }}
          isCellEditable={(params) => {
            return params.row.status !== "locked";
          }}
          processRowUpdate={handleRowUpdate}
          showToolbar
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
}

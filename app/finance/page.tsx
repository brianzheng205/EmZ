"use client";

import { Box } from "@mui/material";
import { styled, Theme, darken } from "@mui/material/styles";
import { DataGrid, GridRowsProp } from "@mui/x-data-grid";
import { useEffect, useState, useMemo } from "react";

import { fetchActiveBudgets, fetchBudget } from "./firebaseUtils";
import { Budget, combineBudgets, columns, getDataRows } from "./utils";

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
  // const [emilyDocRef, setEmilyDocRef] = useState<DocumentReference | null>(
  //   null
  // );
  // const [brianDocRef, setBrianDocRef] = useState<DocumentReference | null>(
  //   null
  // );
  const [emilyBudget, setEmilyBudget] = useState<Budget>({});
  const [brianBudget, setBrianBudget] = useState<Budget>({});
  const [loading, setLoading] = useState<boolean>(true);

  const combinedBudget = useMemo(
    () => combineBudgets(emilyBudget, brianBudget),
    [emilyBudget, brianBudget]
  );

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

      // setEmilyDocRef(document.emily);
      // setBrianDocRef(document.brian);
      setEmilyBudget(emilyB);
      setBrianBudget(brianB);
      setLoading(false);
    });
  }, []);

  // const handleProcessRowUpdate = async (
  //   newRow: BudgetRow,
  //   oldRow: BudgetRow
  // ) => {
  //   const { category, name, ...newValues } = newRow;
  //   const { ...oldValues } = oldRow;

  //   // Determine whose budget changed
  //   const personChanged = Object.keys(newValues).find(
  //     (key) => newValues[key] !== oldValues[key]
  //   );

  //   if (!personChanged) {
  //     return newRow; // No changes detected
  //   }

  //   if (personChanged.startsWith("person1") && emilyDocRef) {
  //     // Update Emily's budget
  //     const updatedEmilyBudget = updateBudgetItem(emilyBudget, category, name, {
  //       [personChanged]: newValues[personChanged],
  //     });
  //     setEmilyBudget(updatedEmilyBudget);

  //     const emilyChanges = {
  //       [`${category}.items`]: updatedEmilyBudget[category].items,
  //     };
  //     await updateBudgetInFirestore(emilyDocRef, emilyChanges);
  //   } else if (personChanged.startsWith("person2") && brianDocRef) {
  //     // Update Brian's budget
  //     const updatedBrianBudget = updateBudgetItem(brianBudget, category, name, {
  //       [personChanged]: newValues[personChanged],
  //     });
  //     setBrianBudget(updatedBrianBudget);

  //     const brianChanges = {
  //       [`${category}.items`]: updatedBrianBudget[category].items,
  //     };
  //     await updateBudgetInFirestore(brianDocRef, brianChanges);
  //   }

  //   return newRow;
  // };

  const rows: GridRowsProp = getDataRows(combinedBudget);

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
          // processRowUpdate={handleProcessRowUpdate}
          showToolbar
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
}

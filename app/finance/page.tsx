"use client";

import { Delete } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { styled, Theme, darken } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import { DocumentReference } from "firebase/firestore";
import * as R from "ramda";
import { useEffect, useMemo, useState } from "react";

import useDialog from "@/hooks/useDialog";

import AddBudgetRowDialog from "./AddBudgetRowDialog";
import {
  deleteBudgetItem,
  fetchActiveBudgets,
  fetchBudget,
  updateBudget,
} from "./firebaseUtils";
import {
  Budget,
  BudgetDataRow,
  getCombineBudgets,
  getUpdatedBudget,
  getChangedCellTime,
  getPersonFromColumnHeader,
  columns,
  getDataRows,
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

const calculatedRowIds = ["savings", "takeHome", "tax", "grossTotal"];

export default function Finance() {
  const [emilyDocRef, setEmilyDocRef] = useState<DocumentReference | null>(
    null
  );
  const [brianDocRef, setBrianDocRef] = useState<DocumentReference | null>(
    null
  );
  const [emilyBudget, setEmilyBudget] = useState<Budget>({} as Budget);
  const [brianBudget, setBrianBudget] = useState<Budget>({} as Budget);
  const [loading, setLoading] = useState<boolean>(true);
  const {
    isDialogOpen: isAddRowDialogOpen,
    openDialog: openAddRowDialog,
    closeDialog: closeAddRowDialog,
  } = useDialog();

  const rows = useMemo(
    () => getDataRows(getCombineBudgets(emilyBudget, brianBudget)),
    [emilyBudget, brianBudget]
  );

  useEffect(() => {
    setLoading(true);

    fetchActiveBudgets().then(async (document) => {
      if (!document) {
        setLoading(false);
        return;
      }

      const emilyBudgetRef = document.emilyBudget;
      const brianBudgetRef = document.brianBudget;
      const emilyB = (await fetchBudget(emilyBudgetRef)) as Budget | null;
      const brianB = (await fetchBudget(brianBudgetRef)) as Budget | null;
      if (!emilyB || !brianB) {
        setLoading(false);
        return;
      }

      setEmilyDocRef(emilyBudgetRef);
      setBrianDocRef(brianBudgetRef);
      setEmilyBudget(emilyB);
      setBrianBudget(brianB);
      setLoading(false);
    });
  }, []);

  const handleRowUpdate = async (
    rawNewRow: BudgetDataRow,
    oldRow: BudgetDataRow
  ) => {
    const { category, name: newName } = rawNewRow;
    const { name: oldName } = oldRow;

    // Determine whose budget changed
    const colChanged = Object.keys(rawNewRow).find(
      (key) => rawNewRow[key] !== oldRow[key]
    );

    if (!colChanged) {
      return rawNewRow; // No changes detected
    }

    if (colChanged === "name") {
      const oldPath = [category, oldName];
      const newPath = [category, newName];
      const existingNames: string[] = R.union(
        R.keys(R.propOr({}, category, emilyBudget) as object),
        R.keys(R.propOr({}, category, brianBudget) as object)
      );

      if (existingNames.includes(newName)) {
        console.error(`Name "${newName}" already exists in the budget.`);
        return oldRow;
      }

      const emilyNewObj = {
        ...(R.path(oldPath, emilyBudget) as object),
      };
      const brianNewObj = {
        ...(R.path(oldPath, brianBudget) as object),
      };
      if (!emilyDocRef || !brianDocRef) {
        console.error("Document reference is null.");
        return rawNewRow;
      }

      const newEmilyBudget = getUpdatedBudget(
        emilyBudget,
        oldPath,
        newPath,
        emilyNewObj
      );
      const newBrianBudget = getUpdatedBudget(
        brianBudget,
        oldPath,
        newPath,
        brianNewObj
      );
      setEmilyBudget(newEmilyBudget);
      setBrianBudget(newBrianBudget);
      const newRows = getDataRows(
        getCombineBudgets(newEmilyBudget, newBrianBudget)
      );

      await updateBudget(emilyDocRef, oldPath, newPath, emilyNewObj);
      await updateBudget(brianDocRef, oldPath, newPath, brianNewObj);
      return newRows.find((row) => row.id === rawNewRow.id) || rawNewRow;
    }

    const personChanged = getPersonFromColumnHeader(colChanged, "Em", "Z");
    const oldPath = [category, newName];
    const newPath = [category, newName];
    const newObj = {
      amount: rawNewRow[colChanged],
      time: getChangedCellTime(colChanged),
    };

    const budget = personChanged === "Em" ? emilyBudget : brianBudget;
    const docRef = personChanged === "Em" ? emilyDocRef : brianDocRef;
    if (!docRef) {
      console.error(`Document reference for ${personChanged} is null.`);
      return;
    }

    const newBudget = getUpdatedBudget(budget, oldPath, newPath, newObj);

    if (personChanged === "Em") {
      setEmilyBudget(newBudget);
    } else {
      setBrianBudget(newBudget);
    }

    updateBudget(docRef, oldPath, newPath, newObj);
    const newRows =
      personChanged === "Em"
        ? getDataRows(getCombineBudgets(newBudget, brianBudget))
        : getDataRows(getCombineBudgets(emilyBudget, newBudget));
    return newRows.find((row) => row.id === rawNewRow.id) || rawNewRow;
  };

  const handleDeleteRow = async (rowToDelete: BudgetDataRow) => {
    const { category, name } = rowToDelete;

    const path = [category, name];

    if (!brianDocRef || !emilyDocRef) {
      console.error("Document references are null.");
      return;
    }

    const newEmilyBudget: Budget = R.dissocPath(path, emilyBudget);
    const newBrianBudget: Budget = R.dissocPath(path, brianBudget);
    setEmilyBudget(newEmilyBudget);
    setBrianBudget(newBrianBudget);
    await deleteBudgetItem(emilyDocRef, path);
    await deleteBudgetItem(brianDocRef, path);
  };

  const handleAddRow = async (
    category: string,
    name: string,
    brianItem: object,
    emilyItem: object
  ) => {
    const newPath = [category, name];

    if (brianDocRef) {
      const newBrianBudget = getUpdatedBudget(
        brianBudget,
        [],
        newPath,
        brianItem
      );
      setBrianBudget(newBrianBudget);
      await updateBudget(brianDocRef, [], newPath, brianItem);
    }

    if (emilyDocRef) {
      const newEmilyBudget = getUpdatedBudget(
        emilyBudget,
        [],
        newPath,
        emilyItem
      );
      setEmilyBudget(newEmilyBudget);
      await updateBudget(emilyDocRef, [], newPath, emilyItem);
    }

    closeAddRowDialog();
  };

  const deleteColumn = {
    field: "delete",
    headerName: "",
    sortable: false,
    width: 50,
    renderCell: (params) => {
      if (calculatedRowIds.includes(params.row.id)) {
        return null; // Do not render the delete button for these rows
      }
      return (
        <Button
          onClick={() => handleDeleteRow(params.row)}
          sx={{ minWidth: 0, padding: 0 }}
        >
          <Delete />
        </Button>
      );
    },
  };

  console.log("rows", rows);

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
        <Button
          variant="contained"
          onClick={openAddRowDialog}
          sx={{ marginBottom: 2 }}
        >
          Add Row
        </Button>
        <StyledDataGrid
          rows={rows}
          columns={[...columns, deleteColumn]}
          loading={loading}
          rowHeight={30}
          getRowClassName={(params) => {
            if (calculatedRowIds.includes(params.id as string)) return "custom";
            return "";
          }}
          isCellEditable={(params) => {
            return params.row.status !== "locked";
          }}
          processRowUpdate={handleRowUpdate}
          showToolbar
          disableRowSelectionOnClick
          hideFooter
          disableColumnSorting
        />
      </Box>

      <AddBudgetRowDialog
        open={isAddRowDialogOpen}
        onClose={closeAddRowDialog}
        onSubmit={handleAddRow}
      />
    </Box>
  );
}

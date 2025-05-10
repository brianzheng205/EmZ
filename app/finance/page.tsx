"use client";

import { Delete, Edit } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";
import { styled, Theme, darken } from "@mui/material/styles";
import { DataGrid, GridRowsProp } from "@mui/x-data-grid";
import { DocumentReference } from "firebase/firestore";
import * as R from "ramda";
import { useEffect, useState } from "react";

import useDialog from "@/hooks/useDialog";

import AddBudgetRowDialog from "./AddBudgetRowDialog";
import EditBudgetDialog from "./EditBudgetDialog";
import {
  deleteBudgetItem,
  fetchActiveBudgets,
  fetchBudget,
  updateBudget,
} from "./firebaseUtils";
import {
  Budget,
  BudgetDataRow,
  CombinedMetadata,
  getCombinedBudgets,
  getUpdatedBudget,
  getChangedCellTime,
  getPersonFromColumnHeader,
  columns,
  getDataRows,
  isSumOfSumRow,
  isSumRow,
  isDataRow,
} from "./utils";

const StyledDataGrid = styled(DataGrid)(({ theme }: { theme: Theme }) => ({
  "& .sumOfSum": {
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
  "& .sum": {
    backgroundColor: theme.palette.secondary.main,
    "&:hover": {
      backgroundColor: darken(theme.palette.secondary.main, 0.1),
    },
    "&.Mui-selected": {
      backgroundColor: theme.palette.secondary.main,
      "&:hover": {
        backgroundColor: darken(theme.palette.secondary.main, 0.1),
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
  const [emilyBudget, setEmilyBudget] = useState<Budget>({} as Budget);
  const [brianBudget, setBrianBudget] = useState<Budget>({} as Budget);
  const [loading, setLoading] = useState<boolean>(true);
  const {
    isDialogOpen: isAddRowDialogOpen,
    openDialog: openAddRowDialog,
    closeDialog: closeAddRowDialog,
  } = useDialog();
  const {
    isDialogOpen: isEditBudgetDialogopen,
    openDialog: openEditBudgetDialog,
    closeDialog: closeEditBudgetDialog,
  } = useDialog();

  const [rows, setRows] = useState<GridRowsProp>([]);

  useEffect(() => {
    const fetchData = async () => {
      setRows(await getDataRows(getCombinedBudgets(emilyBudget, brianBudget)));
    };

    fetchData();
  }, [emilyBudget, brianBudget]);

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
      const newRows = await getDataRows(
        getCombinedBudgets(newEmilyBudget, newBrianBudget)
      );

      await updateBudget(emilyDocRef, oldPath, newPath, emilyNewObj);
      await updateBudget(brianDocRef, oldPath, newPath, brianNewObj);
      return newRows.find((row) => row.id === rawNewRow.id) || rawNewRow;
    }

    if (colChanged === "isMonthly") {
      const path = [category, oldName];

      const emilyNewObj = {
        ...(R.path(path, emilyBudget) as object),
        isMonthly: rawNewRow.isMonthly,
      };
      const brianNewObj = {
        ...(R.path(path, brianBudget) as object),
        isMonthly: rawNewRow.isMonthly,
      };
      if (!emilyDocRef || !brianDocRef) {
        console.error("Document reference is null.");
        return rawNewRow;
      }

      const newEmilyBudget = getUpdatedBudget(
        emilyBudget,
        path,
        path,
        emilyNewObj
      );
      const newBrianBudget = getUpdatedBudget(
        brianBudget,
        path,
        path,
        brianNewObj
      );
      setEmilyBudget(newEmilyBudget);
      setBrianBudget(newBrianBudget);
      const newRows = await getDataRows(
        getCombinedBudgets(newEmilyBudget, newBrianBudget)
      );

      await updateBudget(emilyDocRef, path, path, emilyNewObj);
      await updateBudget(brianDocRef, path, path, brianNewObj);
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
        ? await getDataRows(getCombinedBudgets(newBudget, brianBudget))
        : await getDataRows(getCombinedBudgets(emilyBudget, newBudget));
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

  const handleEditBudgetMetadata = (newMetadata: CombinedMetadata) => {
    const newEmilyMetadata = newMetadata.emily;
    const newBrianMetadata = newMetadata.brian;

    if (
      emilyDocRef &&
      !R.equals(newEmilyMetadata, emilyBudget.metadata || {})
    ) {
      setEmilyBudget((prev) => ({
        ...prev,
        metadata: newEmilyMetadata,
      }));
      updateBudget(emilyDocRef, ["metadata"], ["metadata"], newEmilyMetadata);
    }

    if (
      brianDocRef &&
      !R.equals(newBrianMetadata, brianBudget.metadata || {})
    ) {
      setBrianBudget((prev) => ({
        ...prev,
        metadata: newBrianMetadata,
      }));
      updateBudget(brianDocRef, ["metadata"], ["metadata"], newBrianMetadata);
    }

    closeEditBudgetDialog();
  };

  const deleteColumn = {
    field: "delete",
    headerName: "",
    sortable: false,
    width: 50,
    renderCell: (params) =>
      isDataRow(params.row.status) && (
        <Button
          onClick={() => handleDeleteRow(params.row)}
          sx={{ minWidth: 0, padding: 0 }}
        >
          <Delete />
        </Button>
      ),
  };

  return (
    <Stack
      sx={{
        alignItems: "center",
        height: "100%",
        width: "100%",
        padding: 2,
      }}
    >
      <Stack
        sx={{
          width: 1200,
          gap: 1,
        }}
      >
        <Stack
          sx={{
            flexDirection: "row-reverse",
            gap: 1,
          }}
        >
          <Button variant="contained" onClick={openAddRowDialog}>
            Add Row
          </Button>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => openEditBudgetDialog()}
          >
            Edit
          </Button>
        </Stack>
        <StyledDataGrid
          rows={rows}
          columns={[...columns, deleteColumn]}
          loading={loading}
          rowHeight={30}
          getRowClassName={(params) =>
            isSumOfSumRow(params.row.status)
              ? "sumOfSum"
              : isSumRow(params.row.status)
              ? "sum"
              : ""
          }
          isCellEditable={(params) => isDataRow(params.row.status)}
          processRowUpdate={handleRowUpdate}
          showToolbar
          disableRowSelectionOnClick
          hideFooter
          disableColumnSorting
        />
      </Stack>

      <AddBudgetRowDialog
        open={isAddRowDialogOpen}
        onClose={closeAddRowDialog}
        onSubmit={handleAddRow}
      />

      <EditBudgetDialog
        open={isEditBudgetDialogopen}
        onClose={closeEditBudgetDialog}
        onSubmit={handleEditBudgetMetadata}
        emilyBudget={emilyBudget}
        brianBudget={brianBudget}
      />
    </Stack>
  );
}

"use client";

import { Delete, Edit, Refresh, Add } from "@mui/icons-material";
import { Button, Stack, Container, CircularProgress } from "@mui/material";
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
  BudgetItemRow,
  CombinedMetadata,
  getCombinedBudgets,
  getUpdatedBudget,
  getChangedCellTime,
  getPersonFromColumnHeader,
  columns,
  getRows,
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

export default function FinancePage() {
  const [emilyDocRef, setEmilyDocRef] = useState<DocumentReference | null>(
    null
  );
  const [brianDocRef, setBrianDocRef] = useState<DocumentReference | null>(
    null
  );
  const [emilyBudget, setEmilyBudget] = useState<Budget | null>(null);
  const [brianBudget, setBrianBudget] = useState<Budget | null>(null);
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
    const updateRows = async () => {
      if (!emilyBudget || !brianBudget) {
        return;
      }

      setRows(await getRows(getCombinedBudgets(emilyBudget, brianBudget)));
    };

    updateRows();
  }, [emilyBudget, brianBudget]);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
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
  };

  const handleRowUpdate = async (
    rawNewRow: BudgetItemRow,
    oldRow: BudgetItemRow
  ) => {
    if (!emilyBudget || !brianBudget) {
      console.error("Budgets are not loaded.");
      return oldRow;
    }

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
      const oldPath = ["categories", category, oldName];
      const newPath = ["categories", category, newName];
      const existingNames: string[] = R.union(
        R.keys(R.pathOr({}, ["categories", category], emilyBudget) as object),
        R.keys(R.pathOr({}, ["categories", category], brianBudget) as object)
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
      const newRows = await getRows(
        getCombinedBudgets(newEmilyBudget, newBrianBudget)
      );

      await updateBudget(emilyDocRef, oldPath, newPath, emilyNewObj);
      await updateBudget(brianDocRef, oldPath, newPath, brianNewObj);
      return newRows.find((row) => row.id === rawNewRow.id) || rawNewRow;
    } else if (colChanged === "isRecurring") {
      const path = ["categories", category, oldName];

      const emilyNewObj = {
        ...(R.path(path, emilyBudget) as object),
        isRecurring: rawNewRow.isRecurring,
      };
      const brianNewObj = {
        ...(R.path(path, brianBudget) as object),
        isRecurring: rawNewRow.isRecurring,
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
      const newRows = await getRows(
        getCombinedBudgets(newEmilyBudget, newBrianBudget)
      );

      await updateBudget(emilyDocRef, path, path, emilyNewObj);
      await updateBudget(brianDocRef, path, path, brianNewObj);
      return newRows.find((row) => row.id === rawNewRow.id) || rawNewRow;
    }

    const personChanged = getPersonFromColumnHeader(colChanged, "Em", "Z");
    const oldPath = ["categories", category, newName];
    const newPath = ["categories", category, newName];
    const newObj = {
      amount: rawNewRow[colChanged],
      time: getChangedCellTime(colChanged),
      isRecurring: rawNewRow.isRecurring,
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
        ? await getRows(getCombinedBudgets(newBudget, brianBudget))
        : await getRows(getCombinedBudgets(emilyBudget, newBudget));
    return newRows.find((row) => row.id === rawNewRow.id) || rawNewRow;
  };

  const handleDeleteRow = async (rowToDelete: BudgetItemRow) => {
    const { category, name } = rowToDelete;

    const path = ["categories", category, name];

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
    if (!emilyBudget || !brianBudget) {
      console.error("Budgets are not loaded.");
      return;
    }

    const newPath = ["categories", category, name];

    if (!brianDocRef || !emilyDocRef) {
      console.error("Document references are null.");
      return;
    }

    const newEmilyBudget = getUpdatedBudget(
      emilyBudget,
      [],
      newPath,
      emilyItem
    );
    const newBrianBudget = getUpdatedBudget(
      brianBudget,
      [],
      newPath,
      brianItem
    );

    setEmilyBudget(newEmilyBudget);
    setBrianBudget(newBrianBudget);

    await updateBudget(emilyDocRef, [], newPath, emilyItem);
    await updateBudget(brianDocRef, [], newPath, brianItem);

    closeAddRowDialog();
  };

  const handleEditBudgetMetadata = (newMetadata: CombinedMetadata) => {
    if (!emilyDocRef || !brianDocRef) {
      console.error("Document references are null.");
      return;
    }

    if (!emilyBudget || !brianBudget) {
      console.error("Budgets are not loaded.");
      return;
    }

    const newEmilyMetadata = newMetadata.emilyMetadata;
    const newBrianMetadata = newMetadata.brianMetadata;

    if (!R.equals(newEmilyMetadata, R.dissoc("categories", emilyBudget))) {
      setEmilyBudget((prev) =>
        R.isNotNil(prev)
          ? {
              ...prev,
              ...newEmilyMetadata,
            }
          : null
      );
      updateBudget(emilyDocRef, [], [], newEmilyMetadata);
    }

    if (!R.equals(newBrianMetadata, R.dissoc("categories", brianBudget))) {
      setBrianBudget((prev) =>
        R.isNotNil(prev)
          ? {
              ...prev,
              ...newBrianMetadata,
            }
          : null
      );
      updateBudget(brianDocRef, [], [], newBrianMetadata);
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
          variant="text"
          onClick={() => handleDeleteRow(params.row)}
          sx={{ minWidth: 0, padding: 0 }}
        >
          <Delete />
        </Button>
      ),
  };

  if (!emilyBudget || !brianBudget) {
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
      <Stack
        sx={{
          gap: 1,
        }}
      >
        <Stack
          sx={{
            flexDirection: "row-reverse",
            gap: 1,
          }}
        >
          <Button startIcon={<Refresh />} onClick={fetchBudgets}>
            Refresh
          </Button>
          <Button startIcon={<Add />} onClick={openAddRowDialog}>
            Add
          </Button>
          <Button startIcon={<Edit />} onClick={() => openEditBudgetDialog()}>
            Edit
          </Button>
        </Stack>
        <StyledDataGrid
          sx={{ width: "100%" }}
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
          disableRowSelectionOnClick
          hideFooter
          disableColumnMenu
          disableColumnSorting
          disableColumnResize
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
    </Container>
  );
}

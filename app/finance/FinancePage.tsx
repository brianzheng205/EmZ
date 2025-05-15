"use client";

import { Delete, Edit, Refresh, Add } from "@mui/icons-material";
import {
  Button,
  Stack,
  Container,
  CircularProgress,
  Select,
  MenuItem,
} from "@mui/material";
import { styled, Theme, darken } from "@mui/material/styles";
import { DataGrid, GridRowsProp } from "@mui/x-data-grid";
import { DocumentReference, doc } from "firebase/firestore";
import * as R from "ramda";
import React, { useEffect, useState, useCallback, useMemo } from "react";

import useDialog from "@/hooks/useDialog";
import db from "@firebase";

import AddBudgetRowDialog from "./AddBudgetRowDialog";
import EditBudgetDialog from "./EditBudgetDialog";
import {
  deleteBudgetItem,
  fetchActiveBudgets,
  fetchAllBudgets,
  updateBudget,
} from "./firebaseUtils";
import {
  Budget,
  IdToBudget,
  BudgetItemRow,
  CombinedMetadata,
  getCombinedBudgets,
  getBudgetsWithUpdatedItem,
  getChangedCellTime,
  getPersonFromColumnHeader,
  columns,
  getRows,
  isSumOfSumRow,
  isSumRow,
  isDataRow,
  BudgetItem,
  getActiveBudgets,
} from "./utils";

interface BudgetSelectorProps {
  docRef: DocumentReference;
  setDocRef: (docRef: DocumentReference) => void;
  budgets: IdToBudget;
}

function BudgetSelector({ docRef, setDocRef, budgets }: BudgetSelectorProps) {
  return (
    <Select
      sx={{
        width: 200,
      }}
      value={docRef.id}
      onChange={(e) => setDocRef(doc(db, e.target.value))}
      displayEmpty
      margin="dense"
    >
      {R.pipe(
        R.mapObjIndexed((budget: Budget, budgetId) => (
          <MenuItem key={budgetId} value={budgetId}>
            {budget.name}
          </MenuItem>
        )),
        R.values
      )(budgets)}
    </Select>
  );
}

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

type AllBudgets = {
  active: DocumentReference;
  budgets: IdToBudget;
};

export type AllBudgetsBoth = {
  emily: AllBudgets;
  brian: AllBudgets;
};

export default function FinancePage() {
  const [budgets, setBudgets] = useState<AllBudgetsBoth | null>(null);
  const [loading, setLoading] = useState(true);

  const budgetsEm = useMemo(
    () => (budgets ? budgets.emily.budgets : null),
    [budgets]
  );
  const budgetsZ = useMemo(
    () => (budgets ? budgets.brian.budgets : null),
    [budgets]
  );
  const activeBudgetEm = useMemo(
    () => (budgets ? budgets.emily.budgets[budgets.emily.active.id] : null),
    [budgets]
  );
  const activeBudgetZ = useMemo(
    () => (budgets ? budgets.brian.budgets[budgets.brian.active.id] : null),
    [budgets]
  );

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

  const fetchData = useCallback(async () => {
    setLoading(true);

    const newBudgets = await fetchAllBudgets();

    if (!newBudgets) {
      setLoading(false);
      return;
    }

    fetchActiveBudgets().then(async (document) => {
      if (!document) {
        setLoading(false);
        return;
      }

      const emilyBudgetRef: DocumentReference = document.emilyBudget;
      const brianBudgetRef: DocumentReference = document.brianBudget;

      setBudgets({
        emily: {
          active: emilyBudgetRef,
          budgets: newBudgets.emily,
        },
        brian: {
          active: brianBudgetRef,
          budgets: newBudgets.brian,
        },
      });
      setLoading(false);
    });
  }, [setLoading, setBudgets]);

  const [rows, setRows] = useState<GridRowsProp>([]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!budgets || !activeBudgetEm || !activeBudgetZ) {
      return;
    }

    const updateRows = async () => {
      setRows(await getRows(getCombinedBudgets(activeBudgetEm, activeBudgetZ)));
    };

    updateRows();
  }, [budgets, activeBudgetEm, activeBudgetZ]);

  const getClonedBudgets = (budgets: AllBudgetsBoth) => ({
    emily: {
      active: budgets.emily.active,
      budgets: R.clone(budgets.emily.budgets),
    },
    brian: {
      active: budgets.brian.active,
      budgets: R.clone(budgets.brian.budgets),
    },
  });

  const getUpdatedBudgets = (
    prev: AllBudgetsBoth | null,
    newBudgetEm: Budget,
    newBudgetZ: Budget
  ) => {
    if (!prev) {
      return null;
    }

    const newBudgets = getClonedBudgets(prev);
    newBudgets.emily.budgets[prev.emily.active.id] = newBudgetEm;
    newBudgets.brian.budgets[prev.brian.active.id] = newBudgetZ;
    return newBudgets;
  };

  const handleRowUpdate = async (
    rawNewRow: BudgetItemRow,
    oldRow: BudgetItemRow
  ) => {
    if (!budgets) {
      console.error("Budgets are not loaded.");
      return rawNewRow;
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
        R.keys(
          R.pathOr({}, ["categories", category], activeBudgetEm) as object
        ),
        R.keys(R.pathOr({}, ["categories", category], activeBudgetZ) as object)
      );

      if (existingNames.includes(newName)) {
        return oldRow;
      }

      const newObjEm = {
        ...(R.path(oldPath, activeBudgetEm) as BudgetItem),
      };
      const newObjZ = {
        ...(R.path(oldPath, activeBudgetZ) as BudgetItem),
      };

      const updatedBudgets = getBudgetsWithUpdatedItem(
        budgets,
        oldPath,
        newPath,
        newObjEm,
        newObjZ
      );

      if (!updatedBudgets) {
        return oldRow;
      }

      const { emilyBudget: newBudgetEm, brianBudget: newBudgetZ } =
        getActiveBudgets(updatedBudgets);

      setBudgets(updatedBudgets);
      const newRows = await getRows(
        getCombinedBudgets(newBudgetEm, newBudgetZ)
      );

      await updateBudget(
        updatedBudgets.emily.active,
        oldPath,
        newPath,
        newObjEm
      );
      await updateBudget(
        updatedBudgets.brian.active,
        oldPath,
        newPath,
        newObjZ
      );
      return newRows.find((row) => row.id === rawNewRow.id) || rawNewRow;
    } else if (colChanged === "isRecurring") {
      const path = ["categories", category, oldName];

      const emilyNewObj = {
        ...(R.path(path, activeBudgetEm) as object),
        isRecurring: rawNewRow.isRecurring,
      };
      const brianNewObj = {
        ...(R.path(path, activeBudgetZ) as object),
        isRecurring: rawNewRow.isRecurring,
      };

      const updatedBudgets = getBudgetsWithUpdatedItem(
        budgets,
        path,
        path,
        emilyNewObj,
        brianNewObj
      );
      if (!updatedBudgets) {
        return oldRow;
      }
      setBudgets(updatedBudgets);
      const { emilyBudget: newBudgetEm, brianBudget: newBudgetZ } =
        getActiveBudgets(updatedBudgets);

      const newRows = await getRows(
        getCombinedBudgets(newBudgetEm, newBudgetZ)
      );

      await updateBudget(budgets.emily.active, path, path, emilyNewObj);
      await updateBudget(budgets.brian.active, path, path, brianNewObj);
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

    const docRef =
      personChanged === "Em" ? budgets.emily.active : budgets.brian.active;
    const newBudget = getBudgetsWithUpdatedItem(
      budgets,
      oldPath,
      newPath,
      personChanged === "Em" ? newObj : null,
      personChanged === "Z" ? newObj : null
    );
    if (!newBudget) {
      return oldRow;
    }
    setBudgets(newBudget);
    await updateBudget(docRef, oldPath, newPath, newObj);
    const { emilyBudget: newBudgetEm, brianBudget: newBudgetZ } =
      getActiveBudgets(newBudget);

    const newRows = await getRows(getCombinedBudgets(newBudgetEm, newBudgetZ));
    return newRows.find((row) => row.id === rawNewRow.id) || rawNewRow;
  };

  const handleDeleteRow = async (rowToDelete: BudgetItemRow) => {
    if (!budgets || !activeBudgetEm || !activeBudgetZ) {
      console.error("Budgets are not loaded.");
      return;
    }
    const { category, name } = rowToDelete;
    const path = ["categories", category, name];
    const newBudgetEm: Budget = R.dissocPath(path, activeBudgetEm);
    const newBudgetZ: Budget = R.dissocPath(path, activeBudgetZ);
    setBudgets((prev) => getUpdatedBudgets(prev, newBudgetEm, newBudgetZ));
    await deleteBudgetItem(budgets.emily.active, path);
    await deleteBudgetItem(budgets.brian.active, path);
  };

  const handleAddRow = async (
    category: string,
    name: string,
    brianItem: object,
    emilyItem: object
  ) => {
    if (!budgets) {
      console.error("Budgets are not loaded.");
      return;
    }

    const newPath = ["categories", category, name];
    const newBudgets = getBudgetsWithUpdatedItem(
      budgets,
      [],
      newPath,
      emilyItem,
      brianItem
    );
    setBudgets(newBudgets);

    await updateBudget(newBudgets.emily.active, [], newPath, emilyItem);
    await updateBudget(newBudgets.brian.active, [], newPath, brianItem);

    closeAddRowDialog();
  };

  const handleEditBudgetMetadata = async (newMetadata: CombinedMetadata) => {
    if (!budgets || !activeBudgetEm || !activeBudgetZ) {
      console.error("Budgets are not loaded.");
      return;
    }

    const newEmilyMetadata = newMetadata.emilyMetadata;
    const newBrianMetadata = newMetadata.brianMetadata;
    const newBudgetEm = {
      ...R.clone(activeBudgetEm),
      ...newEmilyMetadata,
    };
    const newBudgetZ = {
      ...R.clone(activeBudgetZ),
      ...newBrianMetadata,
    };
    setBudgets((prev) => getUpdatedBudgets(prev, newBudgetEm, newBudgetZ));

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

  const setDocRef = (docRef: DocumentReference, person: "Em" | "Z") =>
    setBudgets((prev) => {
      if (!prev) {
        return null;
      }

      const newBudgets = getClonedBudgets(prev);
      newBudgets[person === "Em" ? "emily" : "brian"].active = docRef;
      return newBudgets;
    });

  if (
    !budgets ||
    !activeBudgetEm ||
    !activeBudgetZ ||
    !budgetsEm ||
    !budgetsZ
  ) {
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
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
            height: 40,
          }}
        >
          <Stack
            sx={{
              flexDirection: "row",
              gap: 1,
            }}
          >
            <BudgetSelector
              docRef={budgets.emily.active}
              setDocRef={(docRef) => setDocRef(docRef, "Em")}
              budgets={budgetsEm}
            />
            <BudgetSelector
              docRef={budgets.brian.active}
              setDocRef={(docRef) => setDocRef(docRef, "Z")}
              budgets={budgetsZ}
            />
          </Stack>

          <Stack
            sx={{
              flexDirection: "row-reverse",
              gap: 1,
            }}
          >
            <Button startIcon={<Refresh />} onClick={fetchData}>
              Refresh
            </Button>
            <Button startIcon={<Add />} onClick={openAddRowDialog}>
              Add
            </Button>
            <Button startIcon={<Edit />} onClick={openEditBudgetDialog}>
              Edit
            </Button>
          </Stack>
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
        emilyBudget={activeBudgetEm}
        brianBudget={activeBudgetZ}
      />
    </Container>
  );
}

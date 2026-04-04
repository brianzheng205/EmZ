"use client";

import { Add } from "@mui/icons-material";
import { Typography, Select, MenuItem, SelectChangeEvent, IconButton } from "@mui/material";
import { Stack } from "@mui/system";
import * as R from "ramda";
import { useEffect, useMemo, useState } from "react";

import LoadingContainer from "@/components/LoadingContainer";
import useDialog from "@/hooks/useDialog";
import { fetchData, fetchDocuments } from "@/utils";

import { BudgetHeaders, BudgetAccordions, ViewToggle } from "./components";
import AddBudgetDialog from "./components/dialogs/AddBudgetDialog";
import BudgetToolBar from "./components/BudgetToolBar";
import {
  deleteBudgetItem,
  updateBudgetMetadata,
  updateBudgetItem,
  createBudgetItem,
  updateSharedActiveBudgets,
  createBudget,
  deleteBudget,
} from "./firebaseUtils";
import {
  CalculatedBudget,
  FbBudgetWithId,
  FbBudgetItem,
  FbBudgetMetadata,
  FbBudget,
  ViewType,
} from "./types";
import { calculateCategories } from "./utils";

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<FbBudgetWithId[]>([]);
  const [activeBudgetIds, setActiveBudgetIds] = useState<string[]>([]);
  const [viewType, setViewType] = useState<ViewType>(ViewType.MONTHLY_AVERAGE);

  const {
    isDialogOpen: isAddBudgetDialogOpen,
    openDialog: openAddBudgetDialog,
    closeDialog: closeAddBudgetDialog,
  } = useDialog();

  const activeBudgets: CalculatedBudget[] = useMemo(
    () =>
      R.pipe(
        R.filter((budget: FbBudgetWithId) =>
          activeBudgetIds.includes(budget.id),
        ),
        R.map((budget: FbBudgetWithId) =>
          calculateCategories(budget, viewType),
        ),
      )(budgets),
    [activeBudgetIds, budgets, viewType],
  );

  const fetchBudgetsData = async () => {
    const fetchAllBudgets = async () => {
      const financeCollectionName = process.env.NEXT_PUBLIC_FINANCE_COLLECTION;

      if (!financeCollectionName) {
        console.error(
          "NEXT_PUBLIC_FINANCE_COLLECTION environment variable is not set.",
        );
        return;
      }

      try {
        const budgetsData = (await fetchDocuments(
          financeCollectionName,
        )) as FbBudgetWithId[];
        setBudgets(budgetsData);
      } catch (error) {
        console.error("Error fetching all budgets:", error);
      }
    };

    const fetchActiveBudgets = async () => {
      const activeBudgetsData = await fetchData("users/shared");

      if (!activeBudgetsData) {
        console.error("Failed to fetch active budgets.");
        return;
      }

      if (!activeBudgetsData.activeBudgets) {
        console.error("No active budgets found in the fetched data.");
        return;
      }

      setActiveBudgetIds(activeBudgetsData.activeBudgets);
    };

    setLoading(true);
    fetchAllBudgets();
    fetchActiveBudgets();
    setLoading(false);
  };

  useEffect(() => {
    fetchBudgetsData();
  }, []);

  const handleBudgetChange = (event: SelectChangeEvent<string>) => {
    const newBudgetId = event.target.value;
    setActiveBudgetIds([newBudgetId]);
    updateSharedActiveBudgets([newBudgetId]);
  };

  const handleAddBudget = async (newBudget: FbBudget) => {
    const result = await createBudget(newBudget);
    if (result) {
      setBudgets([...budgets, { ...newBudget, id: result.id }]);
      setActiveBudgetIds([result.id]);
      updateSharedActiveBudgets([result.id]);
    }
    closeAddBudgetDialog();
  };

  const handleDeleteBudget = async () => {
    const activeBudgetId = activeBudgetIds[0];
    if (activeBudgetId) {
      await deleteBudget(activeBudgetId);
      const newBudgets = budgets.filter((b) => b.id !== activeBudgetId);
      setBudgets(newBudgets);
      if (newBudgets.length > 0) {
        setActiveBudgetIds([newBudgets[0].id]);
        updateSharedActiveBudgets([newBudgets[0].id]);
      } else {
        setActiveBudgetIds([]);
        updateSharedActiveBudgets([]);
      }
    }
  };

  const handleBudgetMetadataChange = (newMetadata: FbBudgetMetadata) => {
    const activeBudgetId = activeBudgetIds[0];

    const newBudgets = budgets.map((budget) =>
      budget.id === activeBudgetId
        ? {
            ...budget,
            ...newMetadata,
          }
        : budget,
    );
    setBudgets(newBudgets);

    updateBudgetMetadata(activeBudgetId, newMetadata);
  };

  const handleAddItem = (item: FbBudgetItem) => {
    const activeBudgetId = activeBudgetIds[0];

    const newBudgets = budgets.map((budget) =>
      budget.id === activeBudgetId
        ? {
            ...budget,
            budgetItems: [...budget.budgetItems, item],
          }
        : budget,
    );
    setBudgets(newBudgets);

    createBudgetItem(activeBudgetId, item);
  };

  const handleChangeItem = (
    budgetId: string,
    oldItemName: string,
    newItem: Partial<FbBudgetItem>,
  ) => {
    const targetBudget = budgets.find((budget) => budget.id === budgetId);

    if (!targetBudget) {
      console.error("Budget not found for update.");
      return;
    }

    const oldFbItem = targetBudget.budgetItems.find(
      (budgetItem) => budgetItem.name === oldItemName,
    );

    if (!oldFbItem) {
      console.error("Budget item not found for update.");
      return;
    }

    const newBudgets = budgets.map((budget) =>
      budget.id === budgetId
        ? {
            ...budget,
            budgetItems: budget.budgetItems.map((budgetItem) =>
              budgetItem.name === oldItemName
                ? { ...budgetItem, ...newItem }
                : budgetItem,
            ),
          }
        : budget,
    );
    setBudgets(newBudgets);

    const newFbItem = {
      ...oldFbItem,
      ...newItem,
    };
    updateBudgetItem(budgetId, oldFbItem, newFbItem);
  };

  const handleDeleteItem = (budgetId: string, itemName: string) => {
    const targetBudet = budgets.find((budget) => budget.id === budgetId);

    if (!targetBudet) {
      console.error("Budget not found for delete.");
      return;
    }

    const targetItem = targetBudet.budgetItems.find(
      (budgetItem) => budgetItem.name === itemName,
    );

    if (!targetItem) {
      console.error("Budget item not found for delete.");
      return;
    }

    const newBudgets = budgets.map((budget) =>
      budget.id === budgetId
        ? {
            ...budget,
            budgetItems: budget.budgetItems.filter(
              (budgetItem) => budgetItem.name !== itemName,
            ),
          }
        : budget,
    );
    setBudgets(newBudgets);

    deleteBudgetItem(budgetId, targetItem);
  };

  return (
    <LoadingContainer loading={loading}>
      <Stack sx={{ gap: 2, marginTop: 4, marginBottom: 4 }}>
        <Stack direction="row" alignItems="baseline" justifyContent="center">
          <Select
            value={activeBudgetIds[0] || ""}
            onChange={handleBudgetChange}
            variant="standard"
            disableUnderline
            displayEmpty
            sx={{
              typography: "h3",
              fontWeight: "bold",
              "& .MuiSelect-select": {
                padding: 0,
                paddingRight: "32px !important",
              },
            }}
          >
            <MenuItem disabled value="">
              <em>Select a budget...</em>
            </MenuItem>
            {budgets.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name}
              </MenuItem>
            ))}
          </Select>
          <IconButton onClick={openAddBudgetDialog} color="primary" sx={{ ml: 1 }}>
            <Add fontSize="large" />
          </IconButton>
        </Stack>

        <AddBudgetDialog
          open={isAddBudgetDialogOpen}
          onClose={closeAddBudgetDialog}
          onSubmit={handleAddBudget}
        />

        {activeBudgets.length > 0 ? (
          <>
            <Stack
              sx={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <ViewToggle viewType={viewType} onViewTypeChange={setViewType} />
              <BudgetToolBar
                budget={
                  budgets.find((budget) => budget.id === activeBudgetIds[0]) ||
                  ({} as FbBudget)
                }
                onEditMetadata={handleBudgetMetadataChange}
                onAddItem={handleAddItem}
                onRefresh={fetchBudgetsData}
                onDeleteBudget={handleDeleteBudget}
              />
            </Stack>

            <BudgetHeaders />
            <BudgetAccordions
              activeBudgets={activeBudgets}
              onItemChange={handleChangeItem}
              onItemDelete={handleDeleteItem}
              viewType={viewType}
            />
          </>
        ) : (
          <Typography textAlign="center">No active budgets.</Typography>
        )}
      </Stack>
    </LoadingContainer>
  );
}

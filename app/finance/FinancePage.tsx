"use client";

import { Typography, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Stack } from "@mui/system";
import * as R from "ramda";
import { useEffect, useMemo, useState } from "react";

import LoadingContainer from "@/components/LoadingContainer";
import { fetchData, fetchDocuments } from "@/utils";

import { BudgetHeaders, BudgetAccordions, ViewToggle } from "./components";
import BudgetToolBar from "./components/BudgetToolBar";
import {
  deleteBudgetItem,
  updateBudgetMetadata,
  updateBudgetItem,
  createBudgetItem,
  FINANCE_COLLECTION_NAME,
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
      try {
        const budgetsData = (await fetchDocuments(
          FINANCE_COLLECTION_NAME,
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
      {activeBudgets.length > 0 ? (
        <Stack sx={{ gap: 2, marginBottom: 4 }}>
          <Typography variant="h1" sx={{ textAlign: "center" }}>
            {activeBudgets[0].name}
          </Typography>
          <Stack
            sx={{
              gap: 2,
            }}
          >
            <Stack sx={{ alignItems: "center" }}>
              <ViewToggle viewType={viewType} onViewTypeChange={setViewType} />
            </Stack>
            <BudgetToolBar
              budget={
                budgets.find((budget) => budget.id === activeBudgetIds[0]) ||
                ({} as FbBudget)
              }
              onEditMetadata={handleBudgetMetadataChange}
              onAddItem={handleAddItem}
              onRefresh={fetchBudgetsData}
            />
          </Stack>

          <BudgetHeaders />
          <BudgetAccordions
            activeBudgets={activeBudgets}
            onItemChange={handleChangeItem}
            onItemDelete={handleDeleteItem}
            viewType={viewType}
          />
        </Stack>
      ) : (
        <Typography>No active budgets.</Typography>
      )}
    </LoadingContainer>
  );
}

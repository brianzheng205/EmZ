"use client";

import { Typography } from "@mui/material";
import { Stack } from "@mui/system";
import * as R from "ramda";
import { useEffect, useMemo, useState } from "react";

import LoadingContainer from "@/components/LoadingContainer";
import { fetchData, fetchDocuments } from "@/utils";

import { BudgetHeaders, BudgetAccordions } from "./BudgetItems";
import BudgetToolBar from "./BudgetItems/BudgetToolBar";
import { deleteBudgetItem, updateBudgetItem } from "./firebaseUtils";
import { CalculatedBudget, FbBudget, FbBudgetItem } from "./types";
import { getCalculatedCategories } from "./utils";

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<FbBudget[]>([]);
  const [activeBudgetIds, setActiveBudgetIds] = useState<string[]>([]);

  const activeBudgets: CalculatedBudget[] = useMemo(
    () =>
      R.pipe(
        R.filter((budget: FbBudget) => activeBudgetIds.includes(budget.id)),
        R.map(getCalculatedCategories)
      )(budgets),
    [activeBudgetIds, budgets]
  );

  const fetchBudgetsData = async () => {
    const fetchAllBudgets = async () => {
      const financeCollectionName = process.env.NEXT_PUBLIC_FINANCE_COLLECTION;

      if (!financeCollectionName) {
        console.error(
          "NEXT_PUBLIC_FINANCE_COLLECTION environment variable is not set."
        );
        return;
      }

      try {
        const budgetsData = (await fetchDocuments(
          financeCollectionName
        )) as FbBudget[];
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

  const onItemChange = (
    budgetId: string,
    oldItemName: string,
    newItem: Partial<FbBudgetItem>
  ) => {
    const targetBudget = budgets.find((budget) => budget.id === budgetId);

    if (!targetBudget) {
      console.error("Budget not found for update.");
      return;
    }

    const oldFbItem = targetBudget.budgetItems.find(
      (budgetItem) => budgetItem.name === oldItemName
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
                : budgetItem
            ),
          }
        : budget
    );
    setBudgets(newBudgets);

    const newFbItem = {
      ...oldFbItem,
      ...newItem,
    };
    updateBudgetItem(budgetId, oldFbItem, newFbItem);
  };

  const onItemDelete = (budgetId: string, itemName: string) => {
    const targetBudet = budgets.find((budget) => budget.id === budgetId);

    if (!targetBudet) {
      console.error("Budget not found for delete.");
      return;
    }

    const targetItem = targetBudet.budgetItems.find(
      (budgetItem) => budgetItem.name === itemName
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
              (budgetItem) => budgetItem.name !== itemName
            ),
          }
        : budget
    );
    setBudgets(newBudgets);

    deleteBudgetItem(budgetId, targetItem);
  };

  return (
    <LoadingContainer loading={loading}>
      {activeBudgets.length > 0 ? (
        <Stack sx={{ gap: 2, marginBottom: 4 }}>
          <Typography variant="h1">{activeBudgets[0].name}</Typography>
          <BudgetToolBar onRefresh={fetchBudgetsData} />

          <BudgetHeaders />
          <BudgetAccordions
            activeBudgets={activeBudgets}
            onItemChange={onItemChange}
            onItemDelete={onItemDelete}
          />
        </Stack>
      ) : (
        <Typography>No active budgets.</Typography>
      )}
    </LoadingContainer>
  );
}

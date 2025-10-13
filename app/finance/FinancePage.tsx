"use client";

import { Typography } from "@mui/material";
import { Stack } from "@mui/system";
import * as R from "ramda";
import { useEffect, useMemo, useState } from "react";

import LoadingContainer from "@/components/LoadingContainer";
import { fetchData, fetchDocuments } from "@/utils";

import { BUDGETS_COLLECTION } from "./firebaseUtils";
import { Budget, IdToBudget } from "./types";
import { getCalculatedCategories } from "./utils";

// function BudgetAccordion() {
//   return null;
// }

// function BudgetAccordions() {
//   return null;
// }

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<IdToBudget>({});
  const [activeBudgetIds, setActiveBudgetIds] = useState<string[]>([]);

  const activeBudgets: Budget[] = useMemo(
    () => R.values(R.pick(activeBudgetIds, budgets)),
    [activeBudgetIds, budgets]
  );

  useEffect(() => {
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

    const fetchAllBudgets = async () => {
      try {
        const budgetsData = (await fetchDocuments(
          BUDGETS_COLLECTION
        )) as IdToBudget;
        setBudgets(budgetsData);
      } catch (error) {
        console.error("Error fetching all budgets:", error);
      }
    };

    setLoading(true);
    fetchAllBudgets();
    fetchActiveBudgets();
    setLoading(false);
  }, []);

  const firstBudgetExists =
    activeBudgetIds.length > 0 && activeBudgetIds[0] in budgets;

  const firstActiveBudget = budgets[activeBudgetIds[0]];
  console.log(firstActiveBudget);

  const calculatedCategories = getCalculatedCategories(firstActiveBudget);
  console.log(calculatedCategories);

  return (
    <LoadingContainer loading={loading}>
      {firstBudgetExists && (
        <Stack sx={{ gap: 2 }}>
          <Typography variant="h1">{activeBudgets[0].name}</Typography>
          <Typography>Owner: {activeBudgets[0].user}</Typography>
          <Typography>Num Months: {activeBudgets[0].numMonths}</Typography>
        </Stack>
      )}
    </LoadingContainer>
  );
}

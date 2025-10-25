"use client";

import { Typography } from "@mui/material";
import { Stack } from "@mui/system";
import * as R from "ramda";
import { useEffect, useMemo, useState } from "react";

import LoadingContainer from "@/components/LoadingContainer";
import { fetchData, fetchDocuments } from "@/utils";

import { BudgetHeaders, BudgetAccordions } from "./BudgetItems";
import { BUDGETS_COLLECTION } from "./firebaseUtils";
import { CalculatedBudget, IdToBudget } from "./types";
import { getCalculatedCategories } from "./utils";

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<IdToBudget>({});
  const [activeBudgetIds, setActiveBudgetIds] = useState<string[]>([]);

  const activeBudgets: CalculatedBudget[] = useMemo(
    () =>
      R.pipe(
        R.pick(activeBudgetIds),
        R.values,
        R.map(getCalculatedCategories)
      )(budgets),
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

  return (
    <LoadingContainer loading={loading}>
      {activeBudgets.length > 0 ? (
        <Stack sx={{ gap: 2, marginBottom: 4 }}>
          <Typography variant="h1">{activeBudgets[0].name}</Typography>
          <Typography>Owner: {activeBudgets[0].user}</Typography>
          <Typography>Num Months: {activeBudgets[0].numMonths}</Typography>

          <BudgetHeaders />
          <BudgetAccordions activeBudgets={activeBudgets} />
        </Stack>
      ) : (
        <Typography>No active budgets.</Typography>
      )}
    </LoadingContainer>
  );
}

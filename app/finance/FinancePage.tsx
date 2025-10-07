"use client";

import { Typography } from "@mui/material";
import { Stack } from "@mui/system";
import * as R from "ramda";
import { useEffect, useMemo, useState } from "react";

import LoadingContainer from "@/components/LoadingContainer";
import { fetchData, fetchDocuments } from "@/utils";

import { BUDGETS_COLLECTION } from "./firebaseUtils";
import { BudgetNew, IdToBudgetNew } from "./types";

// function BudgetAccordion() {
//   return null;
// }

// function BudgetAccordions() {
//   return null;
// }

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<IdToBudgetNew>({});
  const [activeBudgetIds, setActiveBudgetIds] = useState<string[]>([]);

  const activeBudgets: BudgetNew[] = useMemo(
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
        )) as IdToBudgetNew;
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

  console.log(R.propOr(null, activeBudgetIds[0] || "", budgets));

  return (
    <LoadingContainer loading={loading}>
      {activeBudgets[0] && (
        <Stack sx={{ gap: 2 }}>
          <Typography variant="h1">{activeBudgets[0].name}</Typography>
          <Typography>{activeBudgets[0].user}</Typography>
          <Typography>{activeBudgets[0].numMonths}</Typography>
        </Stack>
      )}
    </LoadingContainer>
  );
}

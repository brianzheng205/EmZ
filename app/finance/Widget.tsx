"use client";

import { Skeleton, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { fetchData, fetchDocuments } from "@/utils";

import { CalculatedBudget, FbBudgetWithId, ViewType } from "./types";
import { calculateCategories } from "./utils";

export default function FinanceWidget() {
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState<CalculatedBudget | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const financeCollectionName = process.env.NEXT_PUBLIC_FINANCE_COLLECTION;
      if (!financeCollectionName) {
        setLoading(false);
        return;
      }

      try {
        const [budgets, activeData] = await Promise.all([
          fetchDocuments(financeCollectionName) as Promise<FbBudgetWithId[]>,
          fetchData("users/shared") as Promise<{
            activeBudgets?: string[];
          } | null>,
        ]);

        const activeId = activeData?.activeBudgets?.[0];
        const activeBudget = budgets.find((b) => b.id === activeId);

        if (!cancelled && activeBudget) {
          setBudget(
            calculateCategories(activeBudget, ViewType.MONTHLY_AVERAGE),
          );
        }
      } catch (error) {
        console.error("Error fetching finance widget data:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Skeleton variant="rounded" height={48} />;

  if (!budget) {
    return (
      <Typography variant="body2" color="text.secondary">
        No active budget.
      </Typography>
    );
  }

  const balance = budget.categories.liquidAssets.sumMonthly;

  return (
    <Stack sx={{ gap: 0.25 }}>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ lineHeight: 1 }}
      >
        Liquid assets / mo
      </Typography>
      <Typography variant="h5" fontWeight={700}>
        {balance.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        })}
      </Typography>
      <Typography variant="caption" color="text.secondary" noWrap>
        {budget.name}
      </Typography>
    </Stack>
  );
}

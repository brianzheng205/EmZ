"use client";

import { Box } from "@mui/material";
import { styled, Theme, darken } from "@mui/material/styles";
import { DataGrid, GridRowsProp } from "@mui/x-data-grid";
import * as R from "ramda";
import { useEffect, useState, useMemo } from "react";

import { fetchActiveBudgets, fetchBudget } from "./firebaseUtils";
import { Budget, CombinedBudget, columns, getDataRows } from "./utils";

const StyledDataGrid = styled(DataGrid)(({ theme }: { theme: Theme }) => ({
  "& .custom": {
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
}));

export default function Finance() {
  const [emilyBudget, setEmilyBudget] = useState<Budget>({});
  const [brianBudget, setBrianBudget] = useState<Budget>({});

  const combinedBudget: CombinedBudget = useMemo(() => {
    if (!emilyBudget || !brianBudget) return {};

    return R.pipe(
      // Get unique sections from both budgets
      () => R.union(Object.keys(emilyBudget), Object.keys(brianBudget)),
      // Transform into object with section keys
      R.reduce(
        (acc, section) => ({
          ...acc,
          [section]: {
            categories: R.pipe(
              // Get unique categories from both budgets
              () =>
                R.union(
                  Object.keys(
                    R.pathOr({}, [section, "categories"], emilyBudget)
                  ),
                  Object.keys(
                    R.pathOr({}, [section, "categories"], brianBudget)
                  )
                ),
              // Transform into object with category keys
              R.reduce(
                (catAcc, category) => ({
                  ...catAcc,
                  [category]: {
                    emily: R.pathOr(
                      { amount: 0, time: "month" },
                      [section, "categories", category],
                      emilyBudget
                    ),
                    brian: R.pathOr(
                      { amount: 0, time: "month" },
                      [section, "categories", category],
                      brianBudget
                    ),
                  },
                }),
                {}
              )
            )(),
            isPreTax:
              R.pathOr(false, [section, "isPreTax"], emilyBudget) ||
              R.pathOr(false, [section, "isPreTax"], brianBudget),
          },
        }),
        {}
      )
    )();
  }, [emilyBudget, brianBudget]);

  useEffect(() => {
    fetchActiveBudgets().then(async (document) => {
      if (!document) return;

      const emilyB = await fetchBudget(document.emily);
      const brianB = await fetchBudget(document.brian);
      if (!emilyB) return;
      if (!brianB) return;
      setEmilyBudget(emilyB);
      setBrianBudget(brianB);
    });
  }, []);

  const rows: GridRowsProp = getDataRows(combinedBudget);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <Box
        sx={{
          height: "90%",
          width: "70%",
        }}
      >
        <StyledDataGrid
          rows={rows}
          columns={columns}
          rowHeight={30}
          getRowClassName={(params) => {
            if (
              ["savings", "take-home", "gross-total"].includes(
                params.id as string
              )
            )
              return "custom";
            return "";
          }}
          showToolbar
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
}

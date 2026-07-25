import {
  Accordion,
  AccordionSummary,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import BudgetHeaders from "./BudgetHeaders";
import BudgetAccordions from "./BudgetAccordions";
import { gridSizes } from "./constants";
import { CalculatedBudget, FbBudgetItem, ViewType } from "../types";

interface BudgetContentProps {
  loading: boolean;
  activeBudgets: CalculatedBudget[];
  sortColumn: "monthly" | "yearly" | null;
  sortDirection: "asc" | "desc";
  onSort: (column: "monthly" | "yearly") => void;
  viewType: ViewType;
  onViewTypeChange: (viewType: ViewType) => void;
  onItemChange: (
    budgetId: string,
    oldItemName: string,
    newItem: Partial<FbBudgetItem>,
  ) => void;
  onItemDelete: (budgetId: string, itemName: string) => void;
}

function BudgetItemSkeleton() {
  return (
    <Accordion disabled sx={{ m: 0 }}>
      <AccordionSummary>
        <Grid
          container
          spacing={2}
          sx={{ width: "100%", alignItems: "center" }}
        >
          <Grid size={gridSizes.NAME}>
            <Skeleton variant="text" width="60%" />
          </Grid>
          <Grid size={gridSizes.REPEAT_FREQ} />
          <Grid
            size={gridSizes.AMOUNT_MONTHLY}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Skeleton variant="text" width="40%" />
          </Grid>
          <Grid
            size={gridSizes.AMOUNT_YEARLY}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Skeleton variant="text" width="40%" />
          </Grid>
          <Grid size={gridSizes.DELETE} />
        </Grid>
      </AccordionSummary>
    </Accordion>
  );
}

export default function BudgetContent({
  loading,
  activeBudgets,
  sortColumn,
  sortDirection,
  onSort,
  viewType,
  onViewTypeChange,
  onItemChange,
  onItemDelete,
}: BudgetContentProps) {
  if (loading) {
    return (
      <>
        <BudgetHeaders
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={onSort}
          viewType={viewType}
          onViewTypeChange={onViewTypeChange}
        />

        <Stack sx={{ gap: 1 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <BudgetItemSkeleton key={i} />
          ))}
        </Stack>
      </>
    );
  }

  if (activeBudgets.length === 0) {
    return <Typography textAlign="center">No active budgets.</Typography>;
  }

  return (
    <>
      <BudgetHeaders
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={onSort}
        viewType={viewType}
        onViewTypeChange={onViewTypeChange}
      />
      <BudgetAccordions
        activeBudgets={activeBudgets}
        onItemChange={onItemChange}
        onItemDelete={onItemDelete}
        viewType={viewType}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
      />
    </>
  );
}

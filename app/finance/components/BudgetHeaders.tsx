import { Grid, Typography, TableSortLabel } from "@mui/material";

import { ACCORDION_SUMMAR_HEADING_VARIANT, gridSizes } from "./constants";

interface BudgetHeadersProps {
  sortColumn?: "monthly" | "yearly" | null;
  sortDirection?: "asc" | "desc";
  onSort?: (column: "monthly" | "yearly") => void;
}

export default function BudgetHeaders({ sortColumn, sortDirection, onSort }: BudgetHeadersProps) {
  return (
    <Grid container spacing={2} sx={{ paddingX: 2 }}>
      <Grid size={gridSizes.NAME}>
        <Typography variant={ACCORDION_SUMMAR_HEADING_VARIANT}>Name</Typography>
      </Grid>
      <Grid size={gridSizes.REPEAT_FREQ}>
        <Typography
          variant={ACCORDION_SUMMAR_HEADING_VARIANT}
          textAlign={"center"}
        >
          Repeat?
        </Typography>
      </Grid>
      <Grid size={gridSizes.AMOUNT_MONTHLY} sx={{ textAlign: "right" }}>
        <TableSortLabel
          active={sortColumn === "monthly"}
          direction={sortColumn === "monthly" ? sortDirection : "desc"}
          onClick={() => onSort && onSort("monthly")}
        >
          <Typography variant={ACCORDION_SUMMAR_HEADING_VARIANT}>
            Monthly
          </Typography>
        </TableSortLabel>
      </Grid>
      <Grid size={gridSizes.AMOUNT_YEARLY} sx={{ textAlign: "right" }}>
        <TableSortLabel
          active={sortColumn === "yearly"}
          direction={sortColumn === "yearly" ? sortDirection : "desc"}
          onClick={() => onSort && onSort("yearly")}
        >
          <Typography variant={ACCORDION_SUMMAR_HEADING_VARIANT}>
            Yearly
          </Typography>
        </TableSortLabel>
      </Grid>
      <Grid size={gridSizes.DELETE} />
    </Grid>
  );
}

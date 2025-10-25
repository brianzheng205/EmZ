import { Typography } from "@mui/material";

import { VARIANT } from "./constants";

interface BudgetAmountCellProps {
  amount: number;
  isSummary?: boolean;
}

export function BudgetAmountCell({
  amount,
  isSummary = false,
}: BudgetAmountCellProps) {
  return (
    <Typography
      variant={isSummary ? VARIANT : "body1"}
      sx={{ textAlign: "right" }}
    >
      ${Math.round(amount)}
    </Typography>
  );
}

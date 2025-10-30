import { Grid, Typography } from "@mui/material";

import { ACCORDION_SUMMAR_HEADING_VARIANT, gridSizes } from "./constants";

export default function BudgetHeaders() {
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
        <Typography variant={ACCORDION_SUMMAR_HEADING_VARIANT}>
          Monthly
        </Typography>
      </Grid>
      <Grid size={gridSizes.AMOUNT_YEARLY} sx={{ textAlign: "right" }}>
        <Typography variant={ACCORDION_SUMMAR_HEADING_VARIANT}>
          Yearly
        </Typography>
      </Grid>
      <Grid size={gridSizes.DELETE} />
    </Grid>
  );
}

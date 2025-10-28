import { Grid, Typography } from "@mui/material";

import { ACCORDION_SUMMAR_HEADING_VARIANT } from "./constants";

export default function BudgetHeaders() {
  return (
    <Grid container spacing={2} sx={{ paddingX: 2 }}>
      <Grid size={3}>
        <Typography variant={ACCORDION_SUMMAR_HEADING_VARIANT}>Name</Typography>
      </Grid>
      <Grid size={3}>
        <Typography variant={ACCORDION_SUMMAR_HEADING_VARIANT}>
          Repeat?
        </Typography>
      </Grid>
      <Grid size={3} sx={{ textAlign: "right" }}>
        <Typography variant={ACCORDION_SUMMAR_HEADING_VARIANT}>
          Monthly
        </Typography>
      </Grid>
      <Grid size={3} sx={{ textAlign: "right" }}>
        <Typography variant={ACCORDION_SUMMAR_HEADING_VARIANT}>
          Yearly
        </Typography>
      </Grid>
    </Grid>
  );
}

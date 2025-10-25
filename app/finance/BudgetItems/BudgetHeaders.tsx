import { Grid, Typography } from "@mui/material";

import { VARIANT } from "./constants";

export default function BudgetHeaders() {
  return (
    <Grid container spacing={2} sx={{ paddingX: 2 }}>
      <Grid size={3}>
        <Typography variant={VARIANT}>Name</Typography>
      </Grid>
      <Grid size={3}>
        <Typography variant={VARIANT}>Repeat?</Typography>
      </Grid>
      <Grid size={3} sx={{ textAlign: "right" }}>
        <Typography variant={VARIANT}>Monthly</Typography>
      </Grid>
      <Grid size={3} sx={{ textAlign: "right" }}>
        <Typography variant={VARIANT}>Yearly</Typography>
      </Grid>
    </Grid>
  );
}

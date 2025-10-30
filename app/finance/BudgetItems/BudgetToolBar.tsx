import { Refresh } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";

interface BudgetToolBarProps {
  onRefresh: () => Promise<void>;
}

export default function BudgetToolBar({ onRefresh }: BudgetToolBarProps) {
  return (
    <Stack sx={{ flexDirection: "row", justifyContent: "flex-end", gap: 1 }}>
      <Button startIcon={<Refresh />} onClick={onRefresh}>
        Refresh
      </Button>
    </Stack>
  );
}

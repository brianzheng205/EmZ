import { Edit, Refresh } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";

import useDialog from "@/hooks/useDialog";

import EditBudgetDialog from "../dialogs/EditBudgetDialog";
import { FbBudget, FbBudgetMetadata } from "../types";

interface BudgetToolBarProps {
  budget: FbBudget;
  onEditMetadata: (metadata: FbBudget) => void;
  onRefresh: () => Promise<void>;
}

export default function BudgetToolBar({
  budget,
  onEditMetadata,
  onRefresh,
}: BudgetToolBarProps) {
  const { isDialogOpen, openDialog, closeDialog } = useDialog();

  const metadata: FbBudgetMetadata = {
    name: budget.name,
    numMonths: budget.numMonths,
    user: budget.user,
  };

  const handleEditSubmit = (newMetadata: FbBudgetMetadata) => {
    onEditMetadata({ ...budget, ...newMetadata });
    closeDialog();
  };

  return (
    <Stack sx={{ flexDirection: "row", justifyContent: "flex-end", gap: 1 }}>
      <Button startIcon={<Edit />} onClick={openDialog}>
        Edit
      </Button>
      <Button startIcon={<Refresh />} onClick={onRefresh}>
        Refresh
      </Button>

      <EditBudgetDialog
        open={isDialogOpen}
        metadata={metadata}
        onClose={closeDialog}
        onSubmit={handleEditSubmit}
      />
    </Stack>
  );
}

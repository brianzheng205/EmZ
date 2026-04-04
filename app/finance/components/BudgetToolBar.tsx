import { Add, Delete, Edit, Refresh } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";

import useDialog from "@/hooks/useDialog";

import AddItemDialog from "./dialogs/AddItemDialog";
import DeleteConfirmationDialog from "./dialogs/DeleteConfirmationDialog";
import EditBudgetDialog from "./dialogs/EditBudgetDialog";
import { FbBudget, FbBudgetItem, FbBudgetMetadata } from "../types";

interface BudgetToolBarProps {
  budget: FbBudget;
  onEditMetadata: (metadata: FbBudget) => void;
  onAddItem: (item: FbBudgetItem) => void;
  onRefresh: () => Promise<void>;
  onDeleteBudget: () => void;
}

export default function BudgetToolBar({
  budget,
  onEditMetadata,
  onAddItem,
  onRefresh,
  onDeleteBudget,
}: BudgetToolBarProps) {
  const {
    isDialogOpen: isEditDialogOpen,
    openDialog: openEditDialog,
    closeDialog: closeEditDialog,
  } = useDialog();
  const {
    isDialogOpen: isAddItemDialogOpen,
    openDialog: openAddItemDialog,
    closeDialog: closeAddItemDialog,
  } = useDialog();
  const {
    isDialogOpen: isDeleteDialogOpen,
    openDialog: openDeleteDialog,
    closeDialog: closeDeleteDialog,
  } = useDialog();

  const metadata: FbBudgetMetadata = {
    name: budget.name,
    numMonths: budget.numMonths,
    user: budget.user,
  };

  const handleEditSubmit = (newMetadata: FbBudgetMetadata) => {
    onEditMetadata({ ...budget, ...newMetadata });
  };

  return (
    <Stack
      sx={{
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 1,
        "& .MuiButton-root": {
          height: "42px",
          "&:hover": {
            backgroundColor: "primary.dark",
          },
        },
      }}
    >
      <Button startIcon={<Edit />} onClick={openEditDialog}>
        Edit
      </Button>
      <Button startIcon={<Add />} onClick={openAddItemDialog}>
        Item
      </Button>
      <Button startIcon={<Delete />} color="error" onClick={openDeleteDialog}>
        Delete
      </Button>
      <Button startIcon={<Refresh />} onClick={onRefresh}>
        Refresh
      </Button>

      <EditBudgetDialog
        open={isEditDialogOpen}
        metadata={metadata}
        onClose={closeEditDialog}
        onSubmit={handleEditSubmit}
      />

      <AddItemDialog
        open={isAddItemDialogOpen}
        allItemNames={budget.budgetItems.map((item) => item.name)}
        onClose={closeAddItemDialog}
        onSubmit={onAddItem}
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={onDeleteBudget}
        title="Delete Budget"
        message={`Are you sure you want to delete the budget "${budget.name}"? This action cannot be undone.`}
      />
    </Stack>
  );
}

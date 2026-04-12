import { Add, Delete, Edit, Refresh } from "@mui/icons-material";
import { IconButton, Tooltip, Stack } from "@mui/material";

import useDialog from "@/hooks/useDialog";

import AddItemDialog from "./dialogs/AddItemDialog";
import DeleteConfirmationDialog from "./dialogs/DeleteConfirmationDialog";
import EditBudgetDialog from "./dialogs/EditBudgetDialog";
import { FbBudget, FbBudgetItem, FbBudgetMetadata, FbBudgetWithId } from "../types";

interface BudgetToolBarProps {
  budget: FbBudget;
  budgets: FbBudgetWithId[];
  onEditMetadata: (metadata: FbBudget) => void;
  onAddItem: (item: FbBudgetItem) => void;
  onRefresh: () => Promise<void>;
  onDeleteBudget: () => void;
}

export default function BudgetToolBar({
  budget,
  budgets,
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
    year: budget.year,
  };

  const handleEditSubmit = (newMetadata: FbBudgetMetadata) => {
    onEditMetadata({ ...budget, ...newMetadata });
  };

  return (
    <Stack
      sx={{
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 0.5,
      }}
    >
      <Tooltip title="Delete Budget">
        <IconButton color="error" onClick={openDeleteDialog}>
          <Delete />
        </IconButton>
      </Tooltip>
      <Tooltip title="Refresh Budgets">
        <IconButton color="primary" onClick={onRefresh}>
          <Refresh />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit Budget">
        <IconButton color="primary" onClick={openEditDialog}>
          <Edit />
        </IconButton>
      </Tooltip>
      <Tooltip title="Add Budget Item">
        <IconButton color="primary" onClick={openAddItemDialog}>
          <Add />
        </IconButton>
      </Tooltip>

      <EditBudgetDialog
        open={isEditDialogOpen}
        budgetId={(budget as FbBudgetWithId).id}
        metadata={metadata}
        budgets={budgets}
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

import { FbBudget, FbBudgetMetadata } from "../types";

import BudgetDialog from "./BudgetDialog";

interface EditBudgetDialogProps {
  open: boolean;
  metadata: FbBudgetMetadata;
  onClose: () => void;
  onSubmit: (newMetadata: FbBudgetMetadata) => void;
}

export default function EditBudgetDialog({
  open,
  metadata,
  onClose,
  onSubmit,
}: EditBudgetDialogProps) {
  const handleSubmit = (newBudget: FbBudget) => {
    const newMetadata: FbBudgetMetadata = {
      name: newBudget.name,
      numMonths: newBudget.numMonths,
      user: newBudget.user,
    };

    onSubmit(newMetadata);
    onClose();
  };

  return (
    <BudgetDialog
      open={open}
      budget={{ ...metadata, budgetItems: [] }}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Edit Budget"
      submitText="Save"
    />
  );
}

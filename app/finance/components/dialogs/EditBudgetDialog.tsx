import { FbBudget, FbBudgetMetadata, FbBudgetWithId } from "../../types";

import BudgetDialog from "./BudgetDialog";

interface EditBudgetDialogProps {
  open: boolean;
  budgetId: string;
  metadata: FbBudgetMetadata;
  budgets: FbBudgetWithId[];
  onClose: () => void;
  onSubmit: (newMetadata: FbBudgetMetadata) => void;
}

export default function EditBudgetDialog({
  open,
  budgetId,
  metadata,
  budgets,
  onClose,
  onSubmit,
}: EditBudgetDialogProps) {
  const handleSubmit = (newBudget: FbBudget) => {
    const newMetadata: FbBudgetMetadata = {
      name: newBudget.name,
      numMonths: newBudget.numMonths,
      user: newBudget.user,
      year: newBudget.year,
    };

    onSubmit(newMetadata);
  };

  return (
    <BudgetDialog
      open={open}
      ignoredBudgetId={budgetId}
      budget={{ ...metadata, budgetItems: [] }}
      existingBudgets={budgets}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Edit Budget"
      submitText="Save"
    />
  );
}

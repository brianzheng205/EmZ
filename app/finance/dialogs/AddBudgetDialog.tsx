import { FbBudget } from "../types";

import BudgetDialog from "./BudgetDialog";

interface AddBudgetDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (budget: FbBudget) => Promise<void>;
}

export default function AddBudgetDialog(props: AddBudgetDialogProps) {
  return (
    <BudgetDialog
      title="Add Budget"
      submitText="Add"
      budget={{ name: "", numMonths: 12, user: "", budgetItems: [] }}
      {...props}
    />
  );
}

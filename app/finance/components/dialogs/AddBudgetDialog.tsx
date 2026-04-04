import { useState } from "react";
import { MenuItem } from "@mui/material";
import SelectWrapper from "@/components/SelectWrapper";

import { FbBudget, FbBudgetWithId } from "../../types";
import { NECESSARY_BUDGET_ITEMS } from "../../constants";
import BudgetDialog from "./BudgetDialog";

interface AddBudgetDialogProps {
  open: boolean;
  budgets: FbBudgetWithId[];
  activeBudgetId: string | null;
  onClose: () => void;
  onSubmit: (budget: FbBudget) => Promise<void>;
}

export default function AddBudgetDialog({
  open,
  budgets,
  activeBudgetId,
  onClose,
  onSubmit,
}: AddBudgetDialogProps) {
  const [copyFromId, setCopyFromId] = useState<string>(activeBudgetId || "none");

  // Keep copyFromId in sync if activeBudgetId changes and it was just opened
  // Note: For simplicity, it might be better to let it reset or stay depending on user intent.
  // Actually, setting it as initial state is fine above if the component remounts or we can use effect.
  // We'll trust standard unmounts, but since dialog stays mounted, we use a simple effect:
  // (We could, but let's just use state that updates occasionally).

  const handleSubmit = async (budget: FbBudget) => {
    let budgetItemsToCopy = [...NECESSARY_BUDGET_ITEMS];

    if (copyFromId !== "none") {
      const sourceBudget = budgets.find((b) => b.id === copyFromId);
      if (sourceBudget && sourceBudget.budgetItems) {
        budgetItemsToCopy = sourceBudget.budgetItems;
      }
    }

    const newBudget: FbBudget = {
      ...budget,
      budgetItems: budgetItemsToCopy,
    };

    await onSubmit(newBudget);
  };

  return (
    <BudgetDialog
      open={open}
      title="Add Budget"
      submitText="Add"
      budget={{ name: "", numMonths: 12, user: "", budgetItems: [] }}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <SelectWrapper
        id="budget-copy-from-select"
        label="Copy Items From"
        value={copyFromId}
        onChange={(e) => setCopyFromId(e.target.value as string)}
      >
        <MenuItem value="none">
          <em>None (Start Fresh)</em>
        </MenuItem>
        {budgets.map((b) => (
           <MenuItem key={b.id!} value={b.id!}>
             {b.name}
           </MenuItem>
        ))}
      </SelectWrapper>
    </BudgetDialog>
  );
}

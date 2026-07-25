import { useEffect, useState } from "react";
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
  const activeBudget = budgets.find((b) => b.id === activeBudgetId);
  const [copyFromId, setCopyFromId] = useState<string>("none");
  const [budgetTemplate, setBudgetTemplate] = useState<FbBudget>({
    name: activeBudget?.name || "",
    numMonths: activeBudget?.numMonths || 12,
    user: activeBudget?.user || "",
    year: activeBudget?.year || new Date().getFullYear(),
    budgetItems: [],
  });

  useEffect(() => {
    if (open) {
      const currentActive = budgets.find((b) => b.id === activeBudgetId);
      setCopyFromId(activeBudgetId || "none");
      if (currentActive) {
        setBudgetTemplate({
          name: currentActive.name,
          numMonths: currentActive.numMonths,
          user: currentActive.user,
          year: currentActive.year,
          budgetItems: [],
        });
      }
    }
  }, [open, activeBudgetId, budgets]);

  const handleCopyFromChange = (newId: string) => {
    setCopyFromId(newId);
    if (newId !== "none") {
      const source = budgets.find((b) => b.id === newId);
      if (source) {
        setBudgetTemplate({
          name: source.name,
          numMonths: source.numMonths,
          user: source.user,
          year: source.year,
          budgetItems: [],
        });
      }
    }
  };

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
      budget={budgetTemplate}
      existingBudgets={budgets}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <SelectWrapper
        id="budget-copy-from-select"
        label="Copy Items From"
        value={copyFromId}
        onChange={(e) => handleCopyFromChange(e.target.value as string)}
        required
      >
        <MenuItem value="none">
          <em>None (Start Fresh)</em>
        </MenuItem>
        {budgets.map((b) => (
          <MenuItem key={b.id!} value={b.id!}>
            {`${b.year ? b.year + " " : ""}${b.name} (${b.user})`}
          </MenuItem>
        ))}
      </SelectWrapper>
    </BudgetDialog>
  );
}

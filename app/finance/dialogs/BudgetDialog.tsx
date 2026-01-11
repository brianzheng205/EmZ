import { MenuItem, TextField } from "@mui/material";
import { useEffect, useState } from "react";

import DialogWrapper from "@/components/DialogWrapper";
import SelectWrapper from "@/components/SelectWrapper";

import { FbBudget } from "../types";

interface BudgetDialogProps {
  open: boolean;
  title: string;
  submitText: string;
  budget: FbBudget;
  onClose: () => void;
  onSubmit: (budget: FbBudget) => void;
}

export default function BudgetDialog({
  open,
  title,
  submitText,
  budget,
  onClose,
  onSubmit,
}: BudgetDialogProps) {
  const [newBudget, setNewBudget] = useState(budget);

  // TODO disable if metadata is the same as current or if metadata is invalid
  const isNameEmpty = newBudget.name.trim() === "";
  const disabled = isNameEmpty;

  useEffect(() => {
    if (open) {
      setNewBudget((prev) => ({
        ...prev,
        name: budget.name,
        numMonths: budget.numMonths,
        user: budget.user,
      }));
    }
  }, [budget.name, budget.numMonths, budget.user, open]);

  const handleSubmit = () => {
    const newSanitizedBudget: FbBudget = {
      ...newBudget,
      name: newBudget.name.trim(),
    };
    onSubmit(newSanitizedBudget);
  };

  return (
    <DialogWrapper
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={title}
      submitText={submitText}
      disabled={disabled}
    >
      <TextField
        label="Name"
        value={newBudget.name}
        onChange={(e) =>
          setNewBudget((prev) => ({ ...prev, name: e.target.value }))
        }
        required
        fullWidth
        error={isNameEmpty}
        helperText={isNameEmpty ? "Please provide a name" : ""}
      />
      <SelectWrapper
        id="budget-number-of-months-select"
        label="Number of Months"
        value={newBudget.numMonths}
        onChange={(e) =>
          setNewBudget((prev) => ({
            ...prev,
            numMonths: Number(e.target.value),
          }))
        }
      >
        {Array.from({ length: 12 }, (_, i) => (
          <MenuItem key={i + 1} value={i + 1}>
            {i + 1}
          </MenuItem>
        ))}
      </SelectWrapper>
      <SelectWrapper
        id="budget-owner-select"
        label="Owner"
        value={newBudget.user}
        onChange={(e) =>
          setNewBudget((prev) => ({ ...prev, user: e.target.value as string }))
        }
      >
        <MenuItem value="emily">emily</MenuItem>
        <MenuItem value="brian">brian</MenuItem>
      </SelectWrapper>
    </DialogWrapper>
  );
}

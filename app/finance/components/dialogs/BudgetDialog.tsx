import { MenuItem, TextField } from "@mui/material";
import { useEffect, useState } from "react";

import DialogWrapper from "@/components/DialogWrapper";
import SelectWrapper from "@/components/SelectWrapper";

import { FbBudget } from "../../types";

interface BudgetDialogProps {
  open: boolean;
  title: string;
  submitText: string;
  budget: FbBudget;
  existingBudgets: FbBudget[];
  onClose: () => void;
  onSubmit: (budget: FbBudget) => void;
  children?: React.ReactNode;
}

export default function BudgetDialog({
  open,
  title,
  submitText,
  budget,
  existingBudgets,
  onClose,
  onSubmit,
  children,
}: BudgetDialogProps) {
  const [newBudget, setNewBudget] = useState(budget);

  const isNameEmpty = newBudget.name.trim() === "";
  const isUserEmpty = !newBudget.user || newBudget.user.trim() === "";
  const isYearInvalid = !newBudget.year || isNaN(newBudget.year);
  
  const isDuplicate = existingBudgets.some(b => 
    b.name.trim().toLowerCase() === newBudget.name.trim().toLowerCase() && 
    b.user === newBudget.user &&
    b.year === Number(newBudget.year) &&
    !(b.name.trim().toLowerCase() === budget.name.trim().toLowerCase() && b.user === budget.user && b.year === budget.year)
  );

  const disabled = isNameEmpty || isUserEmpty || isYearInvalid || isDuplicate;

  useEffect(() => {
    if (open) {
      setNewBudget((prev) => ({
        ...prev,
        name: budget.name,
        numMonths: budget.numMonths,
        user: budget.user,
        year: budget.year,
      }));
    }
  }, [budget.name, budget.numMonths, budget.user, budget.year, open]);

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
        label="Year"
        type="number"
        value={newBudget.year}
        onChange={(e) =>
          setNewBudget((prev) => ({ ...prev, year: Number(e.target.value) }))
        }
        required
        fullWidth
        error={isYearInvalid}
        helperText={isYearInvalid ? "Please provide a valid year" : ""}
      />
      <TextField
        label="Name"
        value={newBudget.name}
        onChange={(e) =>
          setNewBudget((prev) => ({ ...prev, name: e.target.value }))
        }
        required
        fullWidth
        error={isNameEmpty || isDuplicate}
        helperText={isNameEmpty ? "Please provide a name" : isDuplicate ? "This name/year combination is already used for this user." : ""}
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
        id="budget-user-select"
        label="User"
        value={newBudget.user}
        onChange={(e) =>
          setNewBudget((prev) => ({ ...prev, user: e.target.value as string }))
        }
      >
        <MenuItem value="Em">Em</MenuItem>
        <MenuItem value="Z">Z</MenuItem>
      </SelectWrapper>
      {children}
    </DialogWrapper>
  );
}

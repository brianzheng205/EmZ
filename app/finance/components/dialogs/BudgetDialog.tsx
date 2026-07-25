import { Alert, Box, MenuItem, TextField } from "@mui/material";
import { useEffect, useState } from "react";

import DialogWrapper from "@/components/DialogWrapper";
import SelectWrapper from "@/components/SelectWrapper";

import { FbBudget, FbBudgetWithId } from "../../types";

interface BudgetDialogProps {
  open: boolean;
  title: string;
  submitText: string;
  budget: FbBudget;
  existingBudgets: FbBudgetWithId[];
  ignoredBudgetId?: string;
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
  ignoredBudgetId,
  onClose,
  onSubmit,
  children,
}: BudgetDialogProps) {
  const [newBudget, setNewBudget] = useState(budget);

  const isNameEmpty = newBudget.name.trim() === "";
  const isUserEmpty = !newBudget.user || newBudget.user.trim() === "";
  const isYearInvalid = !newBudget.year || isNaN(newBudget.year);

  const isDuplicate = existingBudgets.some(
    (b: FbBudgetWithId) =>
      b.name.trim().toLowerCase() === newBudget.name.trim().toLowerCase() &&
      b.user === newBudget.user &&
      (b.year || 0) === (newBudget.year || 0) &&
      b.id !== ignoredBudgetId,
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
        label="Name"
        value={newBudget.name}
        onChange={(e) =>
          setNewBudget((prev) => ({ ...prev, name: e.target.value }))
        }
        required
        fullWidth
        error={isNameEmpty || isDuplicate}
        helperText={isNameEmpty ? "Please provide a name" : ""}
      />
      <SelectWrapper
        id="budget-year-select"
        label="Year"
        value={newBudget.year || ""}
        onChange={(e) =>
          setNewBudget((prev) => ({ ...prev, year: Number(e.target.value) }))
        }
        required
        error={isDuplicate}
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: 400,
            },
          },
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "left",
          },
          transformOrigin: {
            vertical: "top",
            horizontal: "left",
          },
        }}
      >
        {Array.from({ length: 2101 - 2020 }, (_, i) => 2020 + i).map((y) => (
          <MenuItem key={y} value={y}>
            {y}
          </MenuItem>
        ))}
      </SelectWrapper>
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
        required
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
        required
        error={isDuplicate}
      >
        <MenuItem value="Em">Em</MenuItem>
        <MenuItem value="Z">Z</MenuItem>
      </SelectWrapper>
      {children}
      {isDuplicate && (
        <Box>
          <Alert severity="error" variant="filled">
            This name/year/user combination is already used.
          </Alert>
        </Box>
      )}
    </DialogWrapper>
  );
}

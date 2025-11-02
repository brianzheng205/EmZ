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

  useEffect(() => {
    console.log("updating budget");
    setNewBudget(budget);
  }, [budget]);

  const disabled = false; // TODO disable if metadata is the same as current or if metadata is invalid

  const handleSubmit = () => {
    onSubmit(newBudget);
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

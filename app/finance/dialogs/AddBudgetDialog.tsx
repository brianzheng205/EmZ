import { TextField } from "@mui/material";
import { useState } from "react";

import DialogWrapper from "@/components/DialogWrapper";

import { IdToBudget } from "../types";

interface AddBudgetDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  budgets: IdToBudget;
}

export default function AddBudgetDialog({
  open,
  onClose,
  onSubmit,
  budgets,
}: AddBudgetDialogProps) {
  const [name, setName] = useState("");

  const areSomeInputsInvalid =
    name.trim() === "" ||
    Object.values(budgets).some((budget) => budget.name === name);

  const handleSubmit = () => {
    onSubmit(name);
    onClose();
    setName("");
  };

  const handleClose = () => {
    setName("");
    onClose();
  };

  return (
    <DialogWrapper
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Add New Budget"
      disabled={areSomeInputsInvalid}
    >
      <TextField
        autoFocus
        margin="dense"
        label="Budget Name"
        type="text"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </DialogWrapper>
  );
}

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useState } from "react";

import { IdToBudget } from "./types";

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
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add New Budget</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Budget Name"
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="error">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={areSomeInputsInvalid}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}

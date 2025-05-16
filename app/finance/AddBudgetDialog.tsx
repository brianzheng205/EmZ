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
  budgets: IdToBudget;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export default function AddBudgetDialog({
  open,
  budgets,
  onClose,
  onSubmit,
}: AddBudgetDialogProps) {
  const [name, setName] = useState("");

  const isDisabled =
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
        <Button onClick={handleSubmit} disabled={isDisabled}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useState } from "react";

interface AddBudgetDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export default function AddBudgetDialog({
  open,
  onClose,
  onSubmit,
}: AddBudgetDialogProps) {
  const [name, setName] = useState("");

  const isDisabled = name.trim() === "";

  const onAdd = () => {
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
        <Button onClick={onAdd} disabled={isDisabled}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}

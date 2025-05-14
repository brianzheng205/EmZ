import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from "@mui/material";
import { useState } from "react";

import { capitalizeFirstLetter } from "@/utils";

import { Time, Category } from "./utils";

const categories: Category[] = ["gross", "deductions", "expenses", "savings"];

const CATEGORY_OPTIONS = categories.map((option) => ({
  value: option as Category,
  label: capitalizeFirstLetter(option),
}));

interface BudgetItemInputsProps {
  amount: number;
  setAmount: (value: number) => void;
  time: "month" | "year";
  setTime: (value: "month" | "year") => void;
  personName: string;
}

function BudgetItemInputs({
  amount,
  setAmount,
  time,
  setTime,
  personName,
}: BudgetItemInputsProps) {
  const id = `${personName}-time-select`;
  const labelId = `${id}-label`;

  return (
    <Stack
      sx={{
        flexDirection: "row",
        gap: 2,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <TextField
        margin="dense"
        label={`${personName} Amount`}
        type="number"
        fullWidth
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <FormControl fullWidth margin="dense" variant="outlined">
        <InputLabel id={labelId}>{personName} Time</InputLabel>
        <Select
          labelId={labelId}
          id={id}
          value={time}
          label={`${personName} Time`}
          onChange={(e) => setTime(e.target.value as "month" | "year")}
        >
          <MenuItem value="month">Month</MenuItem>
          <MenuItem value="year">Year</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}

interface AddBudgetRowDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    category: string,
    name: string,
    brianItem: object,
    emilyItem: object
  ) => void;
}

const DEFAULTS = {
  category: "expenses" as Category,
  name: "",
  amount: 0,
  time: "year" as Time,
};

export default function AddBudgetRowDialog({
  open,
  onClose,
  onSubmit,
}: AddBudgetRowDialogProps) {
  const [newRowCategory, setNewRowCategory] = useState<Category>(
    DEFAULTS.category
  );
  const [newRowName, setNewRowName] = useState(DEFAULTS.name);
  const [brianAmount, setBrianAmount] = useState(DEFAULTS.amount);
  const [brianTime, setBrianTime] = useState(DEFAULTS.time);
  const [emilyAmount, setEmilyAmount] = useState(DEFAULTS.amount);
  const [emilyTime, setEmilyTime] = useState(DEFAULTS.time);

  const handleSubmit = () => {
    const brianItem = { amount: brianAmount, time: brianTime };
    const emilyItem = { amount: emilyAmount, time: emilyTime };
    onSubmit(newRowCategory, newRowName, brianItem, emilyItem);
    handleClose();
  };

  const handleClose = () => {
    setNewRowCategory(DEFAULTS.category);
    setNewRowName(DEFAULTS.name);
    setBrianAmount(DEFAULTS.amount);
    setBrianTime(DEFAULTS.time);
    setEmilyAmount(DEFAULTS.amount);
    setEmilyTime(DEFAULTS.time);
    onClose();
  };

  const areSomeInputsInvalid =
    newRowName.trim() === "" ||
    newRowCategory.trim() === "" ||
    (brianAmount <= 0 && emilyAmount <= 0);

  const id = "category-select";
  const labelId = `${id}-label`;

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add New Row</DialogTitle>
      <DialogContent>
        <Box>
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel id={labelId}>Category</InputLabel>
            <Select
              labelId={labelId}
              id={id}
              value={newRowCategory}
              label="Category"
              onChange={(e) => setNewRowCategory(e.target.value as Category)}
            >
              {CATEGORY_OPTIONS.map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <TextField
          margin="dense"
          label="Name"
          fullWidth
          value={newRowName}
          onChange={(e) => setNewRowName(e.target.value)}
        />
        <BudgetItemInputs
          amount={emilyAmount}
          setAmount={setEmilyAmount}
          time={emilyTime}
          setTime={setEmilyTime}
          personName="Emily"
        />
        <BudgetItemInputs
          amount={brianAmount}
          setAmount={setBrianAmount}
          time={brianTime}
          setTime={setBrianTime}
          personName="Brian"
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

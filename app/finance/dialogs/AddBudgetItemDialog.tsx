import {
  TextField,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from "@mui/material";
import * as R from "ramda";
import { useState } from "react";

import DialogWrapper from "@/components/DialogWrapper";
import { capitalizeFirstLetter } from "@/utils";

import { Time, Category, Budget } from "../types";

const categories: Category[] = ["gross", "deductions", "expenses", "savings"];

const CATEGORY_OPTIONS = categories.map((option) => ({
  value: option as Category,
  label: capitalizeFirstLetter(option),
}));

interface BudgetItemInputsByPersonProps {
  amount: number;
  setAmount: (value: number) => void;
  time: "month" | "year";
  setTime: (value: "month" | "year") => void;
  personName: string;
}

function BudgetItemInputsByPerson({
  amount,
  setAmount,
  time,
  setTime,
  personName,
}: BudgetItemInputsByPersonProps) {
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
          onChange={(e) => setTime(e.target.value as Time)}
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
  activeBudgetEm: Budget;
  activeBudgetZ: Budget;
}

const DEFAULTS = {
  category: "expenses" as Category,
  name: "",
  amount: 0,
  time: "year" as Time,
};

const id = "category-select";
const labelId = `${id}-label`;

export default function AddBudgetItemDialog({
  open,
  onClose,
  onSubmit,
  activeBudgetEm,
  activeBudgetZ,
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

  const allNames = new Set<string>();

  R.forEach(
    (budget) =>
      R.forEachObjIndexed(
        (category) =>
          R.forEachObjIndexed(
            (_, name: string) => allNames.add(name),
            category
          ),
        budget.categories
      ),
    [activeBudgetEm, activeBudgetZ]
  );

  const isNameDuplicate = allNames.has(newRowName);

  const areSomeInputsInvalid =
    newRowName.trim() === "" ||
    isNameDuplicate ||
    newRowCategory.trim() === "" ||
    (brianAmount <= 0 && emilyAmount <= 0);

  return (
    <DialogWrapper
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Add New Row"
      disabled={areSomeInputsInvalid}
    >
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
        error={isNameDuplicate}
        helperText={isNameDuplicate ? "Name already exists" : ""}
      />
      <BudgetItemInputsByPerson
        amount={emilyAmount}
        setAmount={setEmilyAmount}
        time={emilyTime}
        setTime={setEmilyTime}
        personName="Emily"
      />
      <BudgetItemInputsByPerson
        amount={brianAmount}
        setAmount={setBrianAmount}
        time={brianTime}
        setTime={setBrianTime}
        personName="Brian"
      />
    </DialogWrapper>
  );
}

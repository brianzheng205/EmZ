import { Box, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, FormHelperText } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import DialogWrapper from "@/components/DialogWrapper";
import SelectWrapper from "@/components/SelectWrapper";
import { NumberInputField } from "mui-treasury/components/number-input";

import { FbBudgetItem, Frequency, ItemType } from "../../types";

const DEFAULT_ITEM: FbBudgetItem = {
  name: "",
  type: ItemType.EXPENSES,
  amount: 100,
  frequency: Frequency.MONTHLY,
  isDefinedYearly: false,
};

interface AddItemDialogProps {
  open: boolean;
  allItemNames: string[];
  onClose: () => void;
  onSubmit: (item: FbBudgetItem) => void;
}

const currencyFormatter = (value: string) => {
  if (!value) return "";
  const parts = value.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$${parts.join(".")}`;
};

const currencyParser = (value: string) => value.replace(/\$|,/g, "");

export default function AddItemDialog({
  open,
  allItemNames,
  onClose,
  onSubmit,
}: AddItemDialogProps) {
  const [newItem, setNewItem] = useState<FbBudgetItem>(DEFAULT_ITEM);

  // TODO implement
  const isNameEmpty = newItem.name.trim() === "";
  const isNameTaken = allItemNames.includes(newItem.name.trim());
  const disabled = isNameEmpty || isNameTaken;

  useEffect(() => {
    if (open) {
      setNewItem(DEFAULT_ITEM);
    }
  }, [open]);

  const handleAmountChange = useCallback((value: number) => {
    if (!value && value !== 0) {
      // check for NaN/null but allow 0
      return;
    }

    setNewItem((prev) => ({
      ...prev,
      amount: value,
    }));
  }, []);

  const handleSubmit = () => {
    onSubmit(newItem);
  };

  return (
    <DialogWrapper
      title="Add Item"
      submitText="Add"
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      disabled={disabled}
    >
      <TextField
        label="Name"
        value={newItem.name}
        onChange={(event) =>
          setNewItem((prev) => ({
            ...prev,
            name: event.target.value,
          }))
        }
        error={isNameEmpty || isNameTaken}
        helperText={
          isNameEmpty
            ? "Please provide a name"
            : isNameTaken
              ? "Name already exists"
              : ""
        }
      />

      <SelectWrapper
        id="budget-item-type-select"
        label="Type"
        value={newItem.type}
        onChange={(event) =>
          setNewItem((prev) => ({
            ...prev,
            type: event.target.value as FbBudgetItem["type"],
          }))
        }
      >
        {Object.entries(ItemType).map(([key, value]) => (
          <MenuItem key={key} value={value}>
            {value}
          </MenuItem>
        ))}
      </SelectWrapper>

      <Stack direction="row" sx={{ gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <NumberInputField
            label="Amount"
            value={newItem.amount}
            onChange={handleAmountChange}
            min={0}
            step={100}
            formatter={currencyFormatter}
            parser={currencyParser}
            fullWidth
          />
        </Box>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <ToggleButtonGroup
            color="primary"
            value={newItem.frequency === Frequency.ONE_TIME ? "Year" : (newItem.isDefinedYearly ? "Year" : "Month")}
            exclusive
            onChange={(event, newValue) => {
              if (newValue !== null) {
                setNewItem((prev) => ({
                  ...prev,
                  isDefinedYearly: newValue === "Year",
                }));
              }
            }}
            fullWidth
            sx={{ height: "56px" }}
            disabled={newItem.frequency === Frequency.ONE_TIME}
          >
            <ToggleButton value="Year" sx={{ borderRadius: 3 }}>
              / Year
            </ToggleButton>
            <ToggleButton value="Month" sx={{ borderRadius: 3 }}>
              / Month
            </ToggleButton>
          </ToggleButtonGroup>
          {newItem.frequency === Frequency.ONE_TIME && (
            <FormHelperText sx={{ ml: 1 }}>
              Required for one time items
            </FormHelperText>
          )}
        </Box>
      </Stack>

      <SelectWrapper
        id="budget-item-frequency-select"
        label="Frequency"
        value={newItem.frequency}
        onChange={(event) =>
          setNewItem((prev) => ({
            ...prev,
            frequency: event.target.value as Frequency,
          }))
        }
      >
        {Object.values(Frequency).map((freq) => (
          <MenuItem key={freq} value={freq}>
            {freq}
          </MenuItem>
        ))}
      </SelectWrapper>
    </DialogWrapper>
  );
}

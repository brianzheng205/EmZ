import {
  Box,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  FormHelperText,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

import DialogWrapper from "@/components/DialogWrapper";
import SelectWrapper from "@/components/SelectWrapper";
import { NumberInputField } from "mui-treasury/components/number-input";

import { BudgetItem, FbBudgetItem, Frequency, ItemType } from "../../types";
import { NECESSARY_BUDGET_ITEM_NAMES } from "../../constants";

const NUM_MONTHS_IN_YEAR = 12;
const NUM_PAYCHECKS_IN_YEAR = 26;

interface EditItemDialogProps {
  open: boolean;
  item: BudgetItem | null;
  allItemNames: string[];
  onClose: () => void;
  onSubmit: (oldName: string, newItem: Partial<FbBudgetItem>) => void;
}

const currencyFormatter = (value: string) => {
  if (!value) return "$";
  const parts = value.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$${parts.join(".")}`;
};

const currencyParser = (value: string) => value.replace(/\$|,/g, "");

export default function EditItemDialog({
  open,
  item,
  allItemNames,
  onClose,
  onSubmit,
}: EditItemDialogProps) {
  const [editItem, setEditItem] = useState<Partial<FbBudgetItem>>({});

  useEffect(() => {
    if (open && item) {
      setEditItem({
        name: item.name,
        type: item.type as ItemType,
        amount: item.amount,
        frequency: item.frequency,
        isDefinedYearly: item.isDefinedYearly || false,
      });
    }
  }, [open, item]);

  const handleAmountChange = useCallback((value: number) => {
    if (!value && value !== 0) return;
    setEditItem((prev) => ({
      ...prev,
      amount: value,
    }));
  }, []);

  const { monthlyTotal, yearlyTotal } = useMemo(() => {
    const amount = editItem.amount ?? 0;

    if (editItem.frequency === Frequency.ONE_TIME) {
      return { monthlyTotal: 0, yearlyTotal: amount };
    }

    let yearly = amount;
    if (!editItem.isDefinedYearly) {
      yearly = amount * NUM_MONTHS_IN_YEAR;
    }

    return {
      monthlyTotal: yearly / NUM_MONTHS_IN_YEAR,
      yearlyTotal: yearly,
    };
  }, [editItem.amount, editItem.isDefinedYearly, editItem.frequency]);

  if (!item) return null;

  const isNecessaryItem = NECESSARY_BUDGET_ITEM_NAMES.includes(item.name);

  const isNameEmpty = (editItem.name || "").trim() === "";
  const isNameTaken =
    editItem.name !== item.name &&
    allItemNames.includes((editItem.name || "").trim());
  const disabled = isNameEmpty || isNameTaken;

  const handleSubmit = () => {
    onSubmit(item.name, {
      ...editItem,
      type: isNecessaryItem ? ItemType.EARNINGS : editItem.type,
    });
  };

  const formatCurrency = (value: number) =>
    Math.round(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  return (
    <DialogWrapper
      title="Edit Item"
      submitText="Update"
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      disabled={disabled}
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 4,
          border: "2px solid",
          borderColor: "secondary.main",
        },
      }}
    >
      <TextField
        label="Name"
        value={editItem.name || ""}
        onChange={(event) =>
          setEditItem((prev) => ({
            ...prev,
            name: event.target.value,
          }))
        }
        disabled={isNecessaryItem}
        error={isNameEmpty || isNameTaken}
        helperText={
          isNameEmpty
            ? "Please provide a name"
            : isNameTaken
              ? "Name already exists"
              : isNecessaryItem
                ? "This item's name cannot be changed."
                : ""
        }
      />

      <SelectWrapper
        id="edit-budget-item-type-select"
        label="Type"
        value={isNecessaryItem ? ItemType.EARNINGS : editItem.type || ""}
        onChange={(event) =>
          setEditItem((prev) => ({
            ...prev,
            type: event.target.value as FbBudgetItem["type"],
          }))
        }
        MenuProps={{ PaperProps: { sx: { borderRadius: 3 } } }}
        disabled={isNecessaryItem}
        helperText={
          isNecessaryItem ? "This item's type cannot be changed." : ""
        }
      >
        {Object.entries(ItemType).map(([key, value]) => (
          <MenuItem key={key} value={value}>
            {value}
          </MenuItem>
        ))}
      </SelectWrapper>

      <Stack direction="row" sx={{ gap: 1 }}>
        <Box sx={{ flex: 1 }}>
          <NumberInputField
            label="Amount"
            value={editItem.amount ?? 0}
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
            value={editItem.frequency === Frequency.ONE_TIME ? "Year" : (editItem.isDefinedYearly ? "Year" : "Month")}
            exclusive
            onChange={(event, newValue) => {
              if (newValue !== null) {
                setEditItem((prev) => ({
                  ...prev,
                  isDefinedYearly: newValue === "Year",
                }));
              }
            }}
            fullWidth
            sx={{ height: "56px" }}
            disabled={editItem.frequency === Frequency.ONE_TIME}
          >
            <ToggleButton value="Year" sx={{ borderRadius: 3 }}>
              / Year
            </ToggleButton>
            <ToggleButton value="Month" sx={{ borderRadius: 3 }}>
              / Month
            </ToggleButton>
          </ToggleButtonGroup>
          {editItem.frequency === Frequency.ONE_TIME && (
            <FormHelperText sx={{ ml: 1 }}>
              Required for one time items
            </FormHelperText>
          )}
        </Box>
      </Stack>

      <SelectWrapper
        id="edit-budget-item-frequency-select"
        label="Frequency"
        value={editItem.frequency || ""}
        onChange={(event) =>
          setEditItem((prev) => ({
            ...prev,
            frequency: event.target.value as Frequency,
          }))
        }
        MenuProps={{ PaperProps: { sx: { borderRadius: 3 } } }}
      >
        {Object.values(Frequency).map((freq) => (
          <MenuItem key={freq} value={freq}>
            {freq}
          </MenuItem>
        ))}
      </SelectWrapper>

      <Divider sx={{ borderColor: "secondary.main" }} />

      <Box
        sx={{
          bgcolor: "background.default",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "secondary.main",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Typography variant="subtitle2" color="primary.main" fontWeight={600}>
          Calculated Totals
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2">Monthly Total</Typography>
          <Typography variant="body2" fontWeight={600}>
            {formatCurrency(monthlyTotal)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2">Yearly Total</Typography>
          <Typography variant="body2" fontWeight={600}>
            {formatCurrency(yearlyTotal)}
          </Typography>
        </Box>
      </Box>
    </DialogWrapper>
  );
}

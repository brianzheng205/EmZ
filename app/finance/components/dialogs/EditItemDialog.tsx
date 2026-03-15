import { Box, Divider, MenuItem, TextField, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

import DialogWrapper from "@/components/DialogWrapper";
import SelectWrapper from "@/components/SelectWrapper";
import { NumberInputField } from "mui-treasury/components/number-input";

import { BudgetItem, FbBudgetItem, Frequency, ItemType } from "../../types";

const NUM_MONTHS_IN_YEAR = 12;
const NUM_PAYCHECKS_IN_YEAR = 26;

interface EditItemDialogProps {
  open: boolean;
  item: BudgetItem | null;
  allItemNames: string[];
  onClose: () => void;
  onSubmit: (oldName: string, newItem: Partial<FbBudgetItem>) => void;
}

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
      // Convert stored amount to per-frequency amount for editing.
      // If isDefinedYearly, the stored amount is the yearly total,
      // so divide it back to the per-frequency amount.
      let perFreqAmount = item.amount;
      if (item.isDefinedYearly && item.frequency !== Frequency.ONE_TIME) {
        switch (item.frequency) {
          case Frequency.MONTHLY:
            perFreqAmount = item.amount / NUM_MONTHS_IN_YEAR;
            break;
          case Frequency.BIWEEKLY:
            perFreqAmount = item.amount / NUM_PAYCHECKS_IN_YEAR;
            break;
        }
      }

      setEditItem({
        name: item.name,
        type: item.type as ItemType,
        amount: Math.round(perFreqAmount),
        frequency: item.frequency,
        isDefinedYearly: false,
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
    const frequency = editItem.frequency;

    if (frequency === Frequency.ONE_TIME) {
      return { monthlyTotal: 0, yearlyTotal: amount };
    }

    // Amount is always per-frequency in the dialog
    switch (frequency) {
      case Frequency.MONTHLY:
        return {
          monthlyTotal: amount,
          yearlyTotal: amount * NUM_MONTHS_IN_YEAR,
        };
      case Frequency.BIWEEKLY:
        return {
          monthlyTotal: amount * (NUM_PAYCHECKS_IN_YEAR / NUM_MONTHS_IN_YEAR),
          yearlyTotal: amount * NUM_PAYCHECKS_IN_YEAR,
        };
      default:
        return { monthlyTotal: 0, yearlyTotal: 0 };
    }
  }, [editItem.amount, editItem.frequency]);

  if (!item) return null;

  const isNameEmpty = (editItem.name || "").trim() === "";
  const isNameTaken =
    editItem.name !== item.name &&
    allItemNames.includes((editItem.name || "").trim());
  const disabled = isNameEmpty || isNameTaken;

  const handleSubmit = () => {
    onSubmit(item.name, editItem);
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
        "& .MuiOutlinedInput-root": {
          borderRadius: 3,
          "& fieldset": {
            borderColor: "secondary.main",
          },
          "&:hover fieldset": {
            borderColor: "primary.main",
          },
          "&.Mui-focused fieldset": {
            borderColor: "primary.main",
          },
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
        id="edit-budget-item-type-select"
        label="Type"
        value={editItem.type || ""}
        onChange={(event) =>
          setEditItem((prev) => ({
            ...prev,
            type: event.target.value as FbBudgetItem["type"],
          }))
        }
        MenuProps={{ PaperProps: { sx: { borderRadius: 3 } } }}
      >
        {Object.entries(ItemType).map(([key, value]) => (
          <MenuItem key={key} value={value}>
            {value}
          </MenuItem>
        ))}
      </SelectWrapper>

      <NumberInputField
        label="Base Amount"
        value={editItem.amount ?? 0}
        onChange={handleAmountChange}
        min={0}
        step={100}
      />

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

import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { NumberInputWrapper } from "../../../components/cells/NumberInputWrapper";
import { FixedCell } from "./Cell";

type FixedCurrencyCellProps = {
  amount: number;
  isSummary?: boolean;
};

export function FixedCurrencyCell({
  amount,
  isSummary = false,
}: FixedCurrencyCellProps) {
  const displayValue = `$${Math.round(amount)}`;

  return (
    <FixedCell
      type="number"
      displayValue={displayValue}
      isSummary={isSummary}
    />
  );
}

type EditableCurrencyCellProps = {
  displayAmount: number;
  editAmount: number;
  onItemAmountChange: (amount: number, hasAmountChanged: boolean) => void;
  isHighlighted?: boolean;
};

export function EditableCurrencyCell({
  displayAmount,
  editAmount,
  onItemAmountChange,
  isHighlighted = false,
}: EditableCurrencyCellProps) {
  const roundedDisplayAmount = Math.round(displayAmount);
  const initialEditAmount = Math.round(editAmount);

  const [newAmount, setNewAmount] = useState(initialEditAmount);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setNewAmount(Math.round(editAmount));
  }, [editAmount]);

  const error = newAmount < 0;
  const errorMessage = newAmount < 0 ? "Amount cannot be negative" : "";

  const handleAmountChange = (val: number | undefined) =>
    setNewAmount(val ?? 0);

  const handleSubmit = () => {
    if (!error) {
      setEditMode(false);
      onItemAmountChange(
        Math.round(newAmount),
        Math.round(newAmount) !== Math.round(editAmount)
      );
    }
  };

  const handleBlur = () => {
    // If we have an error, we can't save. Revert to original.
    // If valid, save.
    // Note: If clicking stepper buttons, focus might be tricky, but useNumberInput usually handles this.
    setEditMode(false);

    if (error) {
      setNewAmount(Math.round(editAmount));
    } else {
      onItemAmountChange(
        Math.round(newAmount),
        Math.round(newAmount) !== Math.round(editAmount)
      );
    }
  };

  const toggleEdit = () => setEditMode(true);

  if (editMode) {
    return (
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <NumberInputWrapper
          value={newAmount}
          step={100}
          onChange={handleAmountChange}
          onBlur={handleBlur}
          onSubmit={handleSubmit}
          error={error}
          helperText={error ? errorMessage : undefined}
          autoFocus
          sx={{
            "& .MuiInputBase-input": { textAlign: "right" },
          }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
      <Typography
        onClick={toggleEdit}
        sx={{
          textAlign: "right",
          cursor: "pointer",
          fontWeight: isHighlighted ? "bold" : "normal",
          color: isHighlighted ? "primary.main" : "inherit",
          "&:hover": {
            color: isHighlighted ? "primary.dark" : "primary.main",
          },
        }}
      >
        {`$${roundedDisplayAmount}`}
      </Typography>
    </Box>
  );
}

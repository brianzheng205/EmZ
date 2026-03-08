import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { NumberInputWrapper } from "../../../components/cells/NumberInputWrapper";
import { FixedCell } from "./Cell";
import { AmountBasis } from "@/finance/types";

type FixedCurrencyCellProps = {
  amount: number;
  isSummary?: boolean;
};

export function FixedCurrencyCell({
  amount,
  isSummary = false,
}: FixedCurrencyCellProps) {
  const displayValue = amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

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
  onItemAmountChange: (amount: number) => void;
  isHighlighted?: boolean;
};

export function EditableCurrencyCell({
  displayAmount,
  editAmount,
  onItemAmountChange,
  isHighlighted = false,
}: EditableCurrencyCellProps) {
  const roundedDisplayAmount = Math.round(displayAmount).toLocaleString(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
  );

  // Rounded amount for editing to ensure user only sees integers.
  const [newAmount, setNewAmount] = useState(Math.round(editAmount));
  const [editMode, setEditMode] = useState(false);

  // Whether the edit value is passed in as a prop, meaning the user hasn't
  // typed anything new and we should submit the exact, unrounded calculated
  // value to avoid precision loss from rounding errors.
  const [isCalculatedValue, setIsCalculatedValue] = useState(true);

  useEffect(() => {
    setNewAmount(Math.round(editAmount));
    setIsCalculatedValue(true);
  }, [editAmount]);

  const error = newAmount < 0;
  const errorMessage = newAmount < 0 ? "Amount cannot be negative" : "";

  const handleAmountChange = (val: number | undefined) => {
    setNewAmount(val ?? 0);

    if (val !== Math.round(editAmount)) {
      setIsCalculatedValue(false);
    }
  };

  const handleSubmit = () => {
    if (error) return;

    setEditMode(false);
    onItemAmountChange(
      isCalculatedValue ? editAmount : Number(newAmount.toFixed(2)),
    );
  };

  const handleBlur = () => {
    setEditMode(false);
    handleSubmit();
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
          size="small"
          sx={{
            "& .MuiInputBase-input": { textAlign: "right", py: 0 },
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
        {roundedDisplayAmount}
      </Typography>
    </Box>
  );
}

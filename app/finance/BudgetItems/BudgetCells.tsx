import { Box, Typography } from "@mui/material";
import { useState } from "react";

import { TextFieldWrapper } from "@/components/TextFieldWrapper";

import { VARIANT } from "./constants";

interface BudgetAmountCellProps {
  initialAmount: number;
  isSummary?: boolean;
  editable?: boolean;
  onActiveBudgetItemChange?: (amount: number) => void;
}

export function BudgetAmountCell({
  initialAmount,
  isSummary = false,
  editable = false,
  onActiveBudgetItemChange = () => {},
}: BudgetAmountCellProps) {
  const roundedAmount = Math.round(initialAmount);

  const [editMode, setEditMode] = useState(false);
  const [amount, setAmount] = useState(roundedAmount);

  const handleClick = () => {
    setEditMode(true);
  };

  const handleSubmit = () => {
    setEditMode(false);
    if (editable) {
      onActiveBudgetItemChange(amount);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      {editMode ? (
        <TextFieldWrapper
          hiddenLabel
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
          handleSubmit={handleSubmit}
          autoFocus
        />
      ) : (
        <Typography
          variant={isSummary ? VARIANT : "body1"}
          onClick={editable ? handleClick : undefined}
          sx={{
            textAlign: "right",
            cursor: "pointer",
            "&:hover": editable
              ? {
                  color: "primary.main",
                }
              : {},
          }}
        >
          ${roundedAmount}
        </Typography>
      )}
    </Box>
  );
}

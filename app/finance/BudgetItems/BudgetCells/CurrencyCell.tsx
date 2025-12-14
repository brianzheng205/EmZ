import { useEffect, useState } from "react";

import { EditableTextFieldCell, FixedCell } from "./Cell";

type FixedCurrencyCellProps = {
  amount: number;
  isSummary?: boolean;
  isHighlighted?: boolean;
};

export function FixedCurrencyCell({
  amount,
  isSummary = false,
  isHighlighted = false,
}: FixedCurrencyCellProps) {
  const displayValue = `$${Math.round(amount)}`;

  return (
    <FixedCell
      type="number"
      displayValue={displayValue}
      isSummary={isSummary}
      isHighlighted={isHighlighted}
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

  useEffect(() => {
    setNewAmount(Math.round(editAmount));
  }, [editAmount]);

  const error = newAmount < 0;
  const errorMessage = newAmount < 0 ? "Amount cannot be negative" : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setNewAmount(Number(e.target.value));

  const handleSubmit = () => {
    onItemAmountChange(
      Math.round(newAmount),
      Math.round(newAmount) !== Math.round(editAmount)
    );
  };

  const handleBlur = () => {
    setNewAmount(Math.round(editAmount));
  };

  return (
    <EditableTextFieldCell
      type="number"
      value={newAmount}
      displayValue={`$${roundedDisplayAmount}`}
      error={error}
      errorMessage={errorMessage}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onBlur={handleBlur}
      isHighlighted={isHighlighted}
    />
  );
}

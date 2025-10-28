import { useEffect, useState } from "react";

import { EditableCell, FixedCell } from "./Cell";

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

type EditableCurrencyCellProps = Omit<FixedCurrencyCellProps, "isSummary"> & {
  onItemAmountChange: (amount: number) => void;
};

export function EditableCurrencyCell({
  amount,
  onItemAmountChange,
}: EditableCurrencyCellProps) {
  const roundedAmount = Math.round(amount);

  const [newAmount, setNewAmount] = useState(roundedAmount);

  useEffect(() => {
    setNewAmount(amount);
  }, [amount]);

  const error = newAmount < 0;
  const errorMessage = newAmount < 0 ? "Amount cannot be negative" : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setNewAmount(Number(e.target.value));

  const handleSubmit = () => {
    onItemAmountChange(newAmount);
  };

  const handleBlur = () => {
    setNewAmount(amount);
  };

  return (
    <EditableCell
      type="number"
      value={newAmount}
      displayValue={`$${roundedAmount}`}
      error={error}
      errorMessage={errorMessage}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onBlur={handleBlur}
    />
  );
}

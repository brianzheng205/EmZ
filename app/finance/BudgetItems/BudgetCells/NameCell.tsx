import { useState } from "react";

import { EditableCell, FixedCell } from "./Cell";

interface FixedNameCellProps {
  name: string;
  isSummary?: boolean;
}

export function FixedNameCell({ name, isSummary = false }: FixedNameCellProps) {
  return <FixedCell type="text" displayValue={name} isSummary={isSummary} />;
}

type EditableNameCellProps = Omit<FixedNameCellProps, "isSummary"> & {
  allItemNames: string[];
  onItemNameChange: (name: string) => void;
};

export function EditableNameCell({
  name,
  allItemNames,
  onItemNameChange = () => {},
}: EditableNameCellProps) {
  const [newName, setNewName] = useState(name);

  const isNameTaken = allItemNames.includes(newName) && newName !== name;
  const isNameEmpty = newName === "";

  const error = isNameTaken || isNameEmpty;
  const errorMessage = isNameTaken
    ? "Name already exists"
    : isNameEmpty
    ? "Name cannot be empty"
    : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setNewName(e.target.value);

  const handleSubmit = () => {
    onItemNameChange(newName);
  };

  const handleBlur = () => {
    setNewName(name);
  };

  return (
    <EditableCell
      type="text"
      value={newName}
      displayValue={name}
      error={error}
      errorMessage={errorMessage}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onBlur={handleBlur}
    />
  );
}

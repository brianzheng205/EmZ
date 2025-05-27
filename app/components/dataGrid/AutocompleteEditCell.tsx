import { Autocomplete, TextField } from "@mui/material";
import { GridRenderEditCellParams } from "@mui/x-data-grid";
import { useState, useEffect, useRef } from "react";

type OPTION = { label: string; value: string };

interface AutocompleteEditInputCellProps {
  params: GridRenderEditCellParams;
  options: OPTION[];
  handleSelect: (value: string) => void;
}

export default function AutocompleteEditInputCell({
  params,
  options,
  handleSelect,
}: AutocompleteEditInputCellProps) {
  const { id, field, value, hasFocus } = params;
  const [inputValue, setInputValue] = useState(value || "");
  const [selectedValue, setSelectedValue] = useState(value || "");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hasFocus) {
      ref.current?.focus();
    }
  }, [hasFocus]);

  const handleChange = (
    event: React.SyntheticEvent,
    newValue: OPTION | string
  ) => {
    setSelectedValue(newValue);
    const finalValue =
      typeof newValue === "string" ? newValue : newValue?.label || "";
    params.api.setEditCellValue({
      id,
      field,
      value: finalValue,
    });
    handleSelect(
      typeof newValue === "string" ? newValue : newValue?.value || ""
    );
  };

  const handleInputChange = (
    event: React.SyntheticEvent,
    newInputValue: string
  ) => {
    setInputValue(newInputValue);
  };

  return (
    <Autocomplete
      ref={ref}
      value={selectedValue}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={options}
      freeSolo
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Type to search or add custom value..."
        />
      )}
    />
  );
}

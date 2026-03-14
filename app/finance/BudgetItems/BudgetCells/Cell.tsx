import { Box, TextField, Typography } from "@mui/material";
import { useState } from "react";

import { TextFieldWrapper } from "@/components/TextFieldWrapper";

import { ACCORDION_SUMMAR_HEADING_VARIANT } from "../constants";

type FixedCellProps = {
  type: string;
  displayValue: string;
  isSummary?: boolean;
};

export function FixedCell({
  type,
  displayValue,
  isSummary = false,
}: FixedCellProps) {
  return (
    <Typography
      variant={isSummary ? ACCORDION_SUMMAR_HEADING_VARIANT : "body1"}
      sx={{
        textAlign: type == "number" ? "right" : "left",
      }}
    >
      {displayValue}
    </Typography>
  );
}

type EditableTextFieldCellProps = Omit<FixedCellProps, "isSummary"> & {
  type: string;
  value: React.ComponentProps<typeof TextField>["value"];
  displayValue: string;
  error: boolean;
  errorMessage: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onBlur: () => void;
  isHighlighted?: boolean;
};

export function EditableTextFieldCell({
  type,
  value,
  displayValue,
  error,
  errorMessage,
  onChange,
  onSubmit,
  onBlur,
  isHighlighted = false,
}: EditableTextFieldCellProps) {
  const [editMode, setEditMode] = useState(false);

  const handleClick = () => {
    setEditMode(true);
  };

  const handleSubmit = () => {
    if (!error) {
      setEditMode(false);
      onSubmit();
    }
  };

  const handleBlur = () => {
    setEditMode(false);

    if (error) {
      onBlur();
    } else {
      onSubmit();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: type == "number" ? "flex-end" : "flex-start",
      }}
    >
      {editMode ? (
        <TextFieldWrapper
          type={type}
          value={value}
          error={error}
          helperText={errorMessage}
          onChange={onChange}
          handleSubmit={handleSubmit}
          onBlur={handleBlur}
          autoFocus
          hiddenLabel
          size="small"
          sx={{
            "& .MuiInputBase-input": { py: 0 },
          }}
        />
      ) : (
        <Typography
          onClick={handleClick}
          sx={{
            textAlign: type == "number" ? "right" : "left",
            cursor: "pointer",
            fontWeight: isHighlighted ? "bold" : "normal",
            color: isHighlighted ? "primary.main" : "inherit",
            "&:hover": {
              color: isHighlighted ? "primary.dark" : "primary.main",
            },
          }}
        >
          {displayValue}
        </Typography>
      )}
    </Box>
  );
}

export function DisabledCell() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        bgcolor: "action.disabledBackground",
        borderRadius: 1,
      }}
    />
  );
}

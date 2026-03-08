import { Chip, MenuItem, SelectChangeEvent } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";

import SelectWrapper from "@/components/SelectWrapper";
import { Frequency } from "@/finance/types";

interface FixedRepeatFreqCellProps {
  repeatFreq: Frequency;
}

export function FixedRepeatFreqCell({ repeatFreq }: FixedRepeatFreqCellProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Chip label={repeatFreq} size="small" color="primary" />
    </Box>
  );
}

interface EditableRepeatFreqCellProps {
  repeatFreq: Frequency;
  onItemRepeatFreqChange: (repeatFreq: Frequency) => void;
}

export function EditableRepeatFreqCell({
  repeatFreq,
  onItemRepeatFreqChange,
}: EditableRepeatFreqCellProps) {
  const [editMode, setEditMode] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);

  const setAll = (open: boolean) => {
    setEditMode(open);
    setSelectOpen(open);
  };

  const handleClick = () => {
    setAll(true);
  };

  const handleSubmit = (event: SelectChangeEvent) => {
    onItemRepeatFreqChange(event.target.value as Frequency);
    handleBlur();
  };

  const handleBlur = () => {
    setAll(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      {editMode ? (
        <SelectWrapper
          id="repeat-freq-select"
          label="Frequency"
          value={repeatFreq}
          onChange={handleSubmit}
          onClose={handleBlur}
          open={selectOpen}
          autoFocus
          size="small"
        >
          {Object.values(Frequency).map((freq) => (
            <MenuItem key={freq} value={freq}>
              {freq}
            </MenuItem>
          ))}
        </SelectWrapper>
      ) : (
        <Chip
          label={repeatFreq}
          onClick={handleClick}
          size="small"
          color="primary"
          sx={{
            cursor: "pointer",
            "&:hover": {
              color: "primary.secondary",
            },
          }}
        />
      )}
    </Box>
  );
}

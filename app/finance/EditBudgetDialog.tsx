import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import * as R from "ramda";
import React, { useState, useEffect, useCallback } from "react";

import { Budget, Metadata, CombinedMetadata } from "./utils";

const isNumMonthsInvalid = (numMonths: number) =>
  numMonths <= 0 || numMonths > 12;

const areAllMetadataValid = (metadata: CombinedMetadata) =>
  !R.any((input) => isNumMonthsInvalid(input.numMonths), R.values(metadata));

interface EditBudgetMetadataProps {
  metadata: Metadata;
  setMetadata: (metadata: Metadata) => void;
  personName: string;
}

function EditBudgetMetadata({
  metadata,
  setMetadata,
  personName,
}: EditBudgetMetadataProps) {
  const onNumMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setMetadata({ ...metadata, numMonths: Number(e.target.value) });

  const numMonthsInvalid = isNumMonthsInvalid(metadata.numMonths);

  return (
    <Stack sx={{ flex: 1 }}>
      <Typography variant="h6">{`${personName}'s Budget`}</Typography>
      <TextField
        autoFocus
        margin="dense"
        label="Number of Months"
        type="number"
        fullWidth
        value={metadata.numMonths}
        onChange={onNumMonthsChange}
        error={numMonthsInvalid}
        helperText={
          numMonthsInvalid ? "Must be between 0 and 12 but not 0" : ""
        }
      />
    </Stack>
  );
}

interface EditBudgetDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (newMetadata: CombinedMetadata) => void;
  emilyBudget: Budget;
  brianBudget: Budget;
}

export default function EditBudgetDialog({
  open,
  onClose,
  onSubmit,
  emilyBudget,
  brianBudget,
}: EditBudgetDialogProps) {
  const getUpdatedMetadata = useCallback(
    () =>
      ({
        emilyMetadata: R.dissoc("categories", emilyBudget),
        brianMetadata: R.dissoc("categories", brianBudget),
      } as CombinedMetadata),
    [emilyBudget, brianBudget]
  );

  const [metadata, setMetadata] = useState<CombinedMetadata>(
    getUpdatedMetadata()
  );

  useEffect(() => {
    setMetadata(getUpdatedMetadata());
  }, [getUpdatedMetadata]);

  const handleSubmit = () => {
    if (areAllMetadataValid(metadata)) {
      onSubmit(metadata);
    }
  };

  const setEmilyMetadata = (newMetadata: Metadata) => {
    setMetadata((prev) => ({
      ...prev,
      emilyMetadata: newMetadata,
    }));
  };

  const setBrianMetadata = (newMetadata: Metadata) => {
    setMetadata((prev) => ({
      ...prev,
      brianMetadata: newMetadata,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Budget</DialogTitle>
      <DialogContent sx={{ minHeight: 120, width: 500 }}>
        <Stack sx={{ flexDirection: "row", justifyContent: "center", gap: 2 }}>
          <EditBudgetMetadata
            metadata={metadata.emilyMetadata}
            setMetadata={setEmilyMetadata}
            personName="Emily"
          />
          <EditBudgetMetadata
            metadata={metadata.brianMetadata}
            setMetadata={setBrianMetadata}
            personName="Brian"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!areAllMetadataValid(metadata)}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

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
import React, { useState, useEffect } from "react";

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
  const [metadata, setMetadata] = useState<CombinedMetadata>({
    brian: {
      numMonths: brianBudget.metadata?.numMonths || 12,
    },
    emily: {
      numMonths: emilyBudget.metadata?.numMonths || 12,
    },
  });

  useEffect(() => {
    setMetadata({
      brian: {
        numMonths: brianBudget.metadata?.numMonths || 12,
      },
      emily: {
        numMonths: emilyBudget.metadata?.numMonths || 12,
      },
    });
  }, [brianBudget, emilyBudget]);

  const handleSubmit = () => {
    if (areAllMetadataValid(metadata)) {
      onSubmit(metadata);
    }
  };

  const setEmilyMetadata = (newMetadata: Metadata) => {
    setMetadata((prev) => ({
      ...prev,
      emily: newMetadata,
    }));
  };

  const setBrianMetadata = (newMetadata: Metadata) => {
    setMetadata((prev) => ({
      ...prev,
      brian: newMetadata,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Budget</DialogTitle>
      <DialogContent sx={{ minHeight: 120, width: 500 }}>
        <Stack sx={{ flexDirection: "row", justifyContent: "center", gap: 2 }}>
          <EditBudgetMetadata
            metadata={metadata.emily}
            setMetadata={setEmilyMetadata}
            personName="Emily"
          />
          <EditBudgetMetadata
            metadata={metadata.brian}
            setMetadata={setBrianMetadata}
            personName="Brian"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!areAllMetadataValid(metadata)}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

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

const isNameInvalid = (name: string) => name.trim() === "";

const isNumMonthsInvalid = (numMonths: number) =>
  numMonths <= 0 || numMonths > 12;

const isMetadataInvalid = (metadata: Metadata) =>
  isNumMonthsInvalid(metadata.numMonths) || isNameInvalid(metadata.name);

const isCombinedMetadataValid = (metadata: CombinedMetadata) =>
  !R.any(isMetadataInvalid, R.values(metadata));

interface EditBudgetMetadataProps {
  metadata: Metadata;
  setMetadata: (metadata: Metadata) => void;
  oldBudgetName: string;
}

function EditBudgetMetadata({
  metadata,
  setMetadata,
  oldBudgetName,
}: EditBudgetMetadataProps) {
  const numMonthsInvalid = isNumMonthsInvalid(metadata.numMonths);

  return (
    <Stack
      sx={{
        width: 200,
      }}
    >
      <Typography
        noWrap
        variant="h6"
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {oldBudgetName}
      </Typography>
      <TextField
        autoFocus
        margin="dense"
        label="Budget Name"
        type="text"
        fullWidth
        value={metadata.name}
        onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
      />
      <TextField
        autoFocus
        margin="dense"
        label="Number of Months"
        type="number"
        fullWidth
        value={metadata.numMonths}
        onChange={(e) =>
          setMetadata({ ...metadata, numMonths: Number(e.target.value) })
        }
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
  onSubmit: (newMetadata: CombinedMetadata) => Promise<void>;
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
  }, [getUpdatedMetadata, open]);

  const handleSubmit = () => {
    if (isCombinedMetadataValid(metadata)) {
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
      <DialogContent
        sx={{
          minHeight: 120,
          width: 500,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Stack
          sx={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <EditBudgetMetadata
            metadata={metadata.emilyMetadata}
            setMetadata={setEmilyMetadata}
            oldBudgetName={emilyBudget.name}
          />
          <EditBudgetMetadata
            metadata={metadata.brianMetadata}
            setMetadata={setBrianMetadata}
            oldBudgetName={brianBudget.name}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isCombinedMetadataValid(metadata)}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

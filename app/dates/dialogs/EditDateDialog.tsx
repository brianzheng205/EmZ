import { IdToDate, Metadata } from "../types";

import DateDialog from "./DateDialog";

interface EditDateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (metadata: Metadata) => void;
  dates: IdToDate;
  initialMetadata: Metadata;
}

export default function EditDateDialog({
  open,
  onClose,
  onSubmit,
  dates,
  initialMetadata,
}: EditDateDialogProps) {
  return (
    <DateDialog
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Edit Date"
      submitText="Save"
      dates={dates}
      initialMetadata={initialMetadata}
    />
  );
}

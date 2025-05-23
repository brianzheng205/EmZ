import DateDialog from "@/dates/dialogs/DateDialog";

import { IdToDate, Metadata } from "../types";

interface AddBudgetDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (metadata: Metadata) => void;
  dates: IdToDate;
}

export default function AddBudgetDialog({
  open,
  onClose,
  onSubmit,
  dates,
}: AddBudgetDialogProps) {
  return (
    <DateDialog
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Add Date"
      submitText="Add"
      dates={dates}
    />
  );
}

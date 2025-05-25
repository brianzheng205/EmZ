import DateDialog from "@/dates/dialogs/DateDialog";

import { IdToPlannerDateWithPlaces, PlannerMetadata } from "../types";

interface AddBudgetDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (metadata: PlannerMetadata) => void;
  dates: IdToPlannerDateWithPlaces;
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

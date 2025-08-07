import { IdToPlannerDateWithPlaces, PlannerMetadata } from "../../types";

import DateDialog from "./DateDialog";

interface AddDateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (metadata: PlannerMetadata) => void;
  dates: IdToPlannerDateWithPlaces;
}

export default function AddDateDialog({
  open,
  onClose,
  onSubmit,
  dates,
}: AddDateDialogProps) {
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

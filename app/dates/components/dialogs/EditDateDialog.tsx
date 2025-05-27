import { IdToPlannerDateWithPlaces, PlannerMetadata } from "../../types";

import DateDialog from "./DateDialog";

interface EditDateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (metadata: PlannerMetadata) => void;
  dates: IdToPlannerDateWithPlaces;
  initialMetadata: PlannerMetadata;
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

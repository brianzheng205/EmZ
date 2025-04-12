import CountdownDialog from "./CountdownDialog";

import { SubmitEventFn } from "../../types";

export default function AddCountdownDialog(props: {
  open: boolean;
  onClose: () => void;
  existingCustomIds: string[];
  onSubmit: SubmitEventFn;
  dateId?: string;
  description?: string;
  isCustomId?: boolean;
}) {
  return (
    <CountdownDialog
      title="Edit Countdown Event"
      submitText="Save"
      {...props}
    />
  );
}

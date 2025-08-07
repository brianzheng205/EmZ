import { EditEventDialogProps } from "../types";

import CountdownDialog from "./EventDialog";

export default function EditEventDialog(props: EditEventDialogProps) {
  return (
    <CountdownDialog title="Edit Countdown" submitText="Save" {...props} />
  );
}

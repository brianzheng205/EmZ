import CountdownDialog from "./CountdownDialog";

import { CountdownEventDialogProps, SubmitEventFn } from "../../types";

export default function AddCountdownDialog(props: CountdownEventDialogProps) {
  return (
    <CountdownDialog title="Add Countdown Event" submitText="Add" {...props} />
  );
}

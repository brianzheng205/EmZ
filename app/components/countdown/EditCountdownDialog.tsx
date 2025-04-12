import CountdownDialog from "./CountdownDialog";

import { CountdownEventDialogProps } from "../../types";

export default function AddCountdownDialog(props: CountdownEventDialogProps) {
  return (
    <CountdownDialog
      title="Edit Countdown Event"
      submitText="Save"
      {...props}
    />
  );
}

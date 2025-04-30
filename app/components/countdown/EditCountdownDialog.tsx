import { CountdownEventDialogProps } from "../../types";

import CountdownDialog from "./CountdownDialog";


export default function AddCountdownDialog(props: CountdownEventDialogProps) {
  return (
    <CountdownDialog
      title="Edit Countdown Event"
      submitText="Save"
      {...props}
    />
  );
}

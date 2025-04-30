import { CountdownEventDialogProps } from "../../types";

import CountdownDialog from "./CountdownDialog";


export default function AddCountdownDialog(props: CountdownEventDialogProps) {
  return (
    <CountdownDialog title="Add Countdown Event" submitText="Add" {...props} />
  );
}

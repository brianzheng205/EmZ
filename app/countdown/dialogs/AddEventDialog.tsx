import { RepeatFrequency } from "@shared/types";

import { EventDialogSharedProps } from "../types";

import CountdownDialog from "./EventDialog";

export default function AddCountdownDialog(props: EventDialogSharedProps) {
  return (
    <CountdownDialog
      title="Add Countdown"
      submitText="Add"
      initialEventData={{
        date: "",
        repeatFreq: RepeatFrequency.Never,
        description: "",
      }}
      {...props}
    />
  );
}

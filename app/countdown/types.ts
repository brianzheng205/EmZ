import { RepeatFrequency, FbEvent } from "@lib/countdown/types";

export type Event = FbEvent & {
  id: string;
};

export type GroupedEvents = { [date: string]: Event[] };

export type AddEventFn = (
  date: string,
  repeatFreq: RepeatFrequency,
  description: string
) => Promise<void>;

export type UpdateEventFn = (
  id: string,
  date: string,
  repeatFreq: RepeatFrequency,
  description: string
) => Promise<void>;

export type DeleteEventFn = (id: string) => Promise<void>;

export interface EventDialogSharedProps {
  open: boolean;
  onClose: () => void;
  onSubmit: AddEventFn;
}

export type EditEventDialogProps = EventDialogSharedProps & {
  initialEventData: FbEvent;
};

export type EventGroupsUpdaterFn = (prevEvents: Event[]) => Event[];

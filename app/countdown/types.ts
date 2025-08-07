export type Event = {
  id: string;
  date: string;
  description: string;
};

export type GroupedEvents = { [date: string]: Event[] };

export type AddEventFn = (date: string, description: string) => Promise<void>;

export type UpdateEventFn = (
  id: string,
  date: string,
  description: string
) => Promise<void>;

export type DeleteEventFn = (id: string, date: string) => Promise<void>;

export interface EventDialogSharedProps {
  open: boolean;
  onClose: () => void;
  onSubmit: AddEventFn;
}

export type EditEventDialogProps = EventDialogSharedProps & {
  initialInputs: { date: string; description: string };
};

export type EventGroupsUpdaterFn = (prevEvents: Event[]) => Event[];

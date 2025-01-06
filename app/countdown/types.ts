export type CountdownEvent = {
  id: string;
  date: Date;
  description: string;
};

export type AddEventFn = (date: string, description: string) => Promise<void>;

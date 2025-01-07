export type CountdownEvent = {
  id: string; // date string like "1-6-2024"
  descriptions: string[];
};

export type AddEventFn = (date: string, description: string) => Promise<void>;

export type CountdownEvent = {
  id: string; // date string like "1-6-2024" or custom text
  descriptions: string[];
  isCustomId?: boolean;
};

export type AddEventFn = (
  id: string,
  description: string,
  isCustomId?: boolean
) => Promise<void>;

export type EditEventFn = (
  oldId: string,
  oldDescription: string,
  newId: string,
  newDescription: string,
  isCustomId?: boolean
) => Promise<void>;

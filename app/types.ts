// COUNTDOWN

export interface CountdownEvent {
  id: string; // date string like "1-6-2024" or custom text
  descriptions: string[];
  isCustomId: boolean;
}

export interface AddEventFn {
  (id: string, description: string, isCustomId: boolean): Promise<void>;
}

export interface EditEventFn {
  (
    oldId: string,
    oldDescription: string,
    newId: string,
    newDescription: string,
    isCustomId: boolean
  ): Promise<void>;
}

export interface DeleteEventFn {
  (dateId: string, description: string): Promise<void>;
}

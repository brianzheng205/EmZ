import { FaPencilAlt, FaTrash } from "react-icons/fa";

import EditCountdownForm from "./forms/EditCountdownForm";

import { CountdownEvent } from "../types";

interface EditEventFn {
  (
    dateId: string,
    oldDescription: string,
    newId: string,
    newDescription: string,
    isCustomId?: boolean
  ): Promise<void>;
}

interface CountdownEventCardProps {
  event: CountdownEvent;
  editingEvent: { dateId: string; description: string } | null;
  setEditingEvent: (
    event: { dateId: string; description: string } | null
  ) => void;
  formatCountdown: (id: string, isCustomId?: boolean) => string;
  editEvent: EditEventFn;
  deleteEvent: (dateId: string, description: string) => Promise<void>;
  getExistingCustomIds: () => string[];
}

export default function CountdownEventCard({
  event,
  editingEvent,
  setEditingEvent,
  formatCountdown,
  editEvent,
  deleteEvent,
  getExistingCustomIds,
}: CountdownEventCardProps) {
  return (
    <article className="bg-accent rounded-2xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {formatCountdown(event.id, event.isCustomId)}
        </h2>
        <span className="text-sm text-gray-500">
          {event.isCustomId ? event.id : event.id.replace(/-/g, "/")}
        </span>
      </div>
      <div className="space-y-3">
        {event.descriptions.map((description, index) => (
          <div
            key={`${event.id}-${index}`}
            className="flex justify-between items-start border-b border-primary/20 pb-3 last:border-0"
          >
            {editingEvent?.dateId === event.id &&
            editingEvent?.description === description ? (
              <EditCountdownForm
                dateId={event.id}
                description={description}
                onEdit={editEvent}
                onCancel={() => setEditingEvent(null)}
                existingCustomIds={getExistingCustomIds()}
                isCustomId={event.isCustomId}
              />
            ) : (
              <>
                <p>{description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setEditingEvent({ dateId: event.id, description })
                    }
                    className="text-primary hover:text-secondary"
                  >
                    <FaPencilAlt className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteEvent(event.id, description)}
                    className="text-primary hover:text-secondary"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </article>
  );
}

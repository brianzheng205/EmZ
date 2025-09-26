"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RepeatIcon from "@mui/icons-material/Repeat";
import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import * as R from "ramda";
import { useEffect, useState } from "react";

import { toUSDateStr } from "@/utils";
import { RepeatFrequency } from "@shared/types";
import { toDate } from "shared/utils";

import EditCountdownDialog from "./dialogs/EditEventDialog";
import { Event, UpdateEventFn, DeleteEventFn } from "./types";

const convertDateToCountdown = (id: string) => {
  const date = toDate(id);
  if (date === null) return "D-∞";

  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate days until date
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays < 0 ? "PAST" : diffDays === 0 ? "TODAY" : `D-${diffDays}`;
};

interface EventContentProps {
  event: Event;
  onEditSubmit: UpdateEventFn;
  onDelete: DeleteEventFn;
}

function EventContent({
  event,
  onEditSubmit,
  onDelete: handleDelete,
}: EventContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState(event.date);
  const [repeatFreq, setRepeatFreq] = useState(event.repeatFreq);
  const [description, setDescription] = useState(event.description);

  useEffect(() => {
    setDate(event.date);
    setRepeatFreq(event.repeatFreq);
    setDescription(event.description);
  }, [event]);

  const handleEdit = () => {
    setDate(event.date);
    setRepeatFreq(event.repeatFreq);
    setDescription(event.description);
    setIsEditing(true);
  };

  return (
    <>
      <Stack
        sx={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        {
          <Stack>
            <Typography>{description}</Typography>
            {event.repeatFreq !== RepeatFrequency.Never && (
              <Stack
                sx={{ flexDirection: "row", alignItems: "center", gap: 0.5 }}
              >
                <RepeatIcon fontSize="small" color="disabled" />
                <Typography variant="caption" color="text.secondary">
                  {event.repeatFreq}
                </Typography>
              </Stack>
            )}
          </Stack>
        }
        <Stack sx={{ flexDirection: "row" }}>
          <IconButton
            aria-label="edit"
            onClick={handleEdit}
            sx={{ padding: "4px" }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="delete"
            onClick={() => handleDelete(event.id)}
            sx={{ padding: "4px" }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      <EditCountdownDialog
        open={isEditing}
        onClose={() => setIsEditing(false)}
        onSubmit={R.curry(onEditSubmit)(event.id)}
        initialEventData={{ date, repeatFreq, description }}
      />
    </>
  );
}

interface EventGroupCardProps {
  date: string;
  events: Event[];
  onEditSubmit: UpdateEventFn;
  onDelete: DeleteEventFn;
}

export default function EventGroupCard({
  date,
  events,
  onEditSubmit,
  onDelete,
}: EventGroupCardProps) {
  return (
    <Card>
      <CardHeader
        title={convertDateToCountdown(date)}
        subheader={date === "" ? "D-∞" : toUSDateStr(date)}
      />

      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {events.map((event, index) => (
          <EventContent
            key={index}
            event={event}
            onEditSubmit={onEditSubmit}
            onDelete={onDelete}
          />
        ))}
      </CardContent>
    </Card>
  );
}

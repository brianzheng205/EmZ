"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import EditCountdownDialog from "./dialogs/EditEventDialog";
import { Event, UpdateEventFn, DeleteEventFn } from "./types";

const convertDateToCountdown = (id: string, isCustomID?: boolean) => {
  if (isCustomID) return id;

  // Parse the date from datestring (YYYY-MM-DD)
  const [year, month, day] = id.split("-").map(Number);
  const date = new Date(year, month - 1, day); // month is 0-based

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
  const [description, setDescription] = useState(event.description);

  useEffect(() => {
    setDate(event.date);
  }, [event.date]);

  useEffect(() => {
    setDescription(event.description);
  }, [event.description]);

  const handleEdit = () => {
    // Update editing input states
    setDate(event.date);
    setDescription(event.description);
    setIsEditing(true);
  };

  return (
    <>
      <Stack
        // TODO remove unnecessary styling
        sx={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography
          variant="body1"
          gutterBottom
          sx={{
            overflow: "hidden",
            wordBreak: "break-word",
          }}
        >
          {description}
        </Typography>
        <Stack sx={{ flexDirection: "row" }}>
          <IconButton
            aria-label="edit"
            onClick={() => handleEdit()}
            sx={{ padding: "4px" }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="delete"
            onClick={() => handleDelete(event.id, event.date)}
            sx={{ padding: "4px" }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      <EditCountdownDialog
        open={isEditing}
        onClose={() => setIsEditing(false)}
        onSubmit={(date, description) =>
          onEditSubmit(event.id, date, description)
        }
        initialInputs={{ date, description }}
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
    <>
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardHeader
          title={convertDateToCountdown(date)}
          subheader={date === "D-∞" ? date : date.replace(/-/g, "/")}
        />

        <CardContent>
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
    </>
  );
}

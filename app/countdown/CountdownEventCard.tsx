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
import * as R from "ramda";
import { useState } from "react";

import { CountdownEvent, EditEventFn, DeleteEventFn } from "../types";

import EditCountdownDialog from "./EditCountdownDialog";

interface CountdownEventCardProps {
  event: CountdownEvent;
  onEdit: EditEventFn;
  onDelete: DeleteEventFn;
  formatCountdown: (id: string, isCustomId?: boolean) => string;
  existingCustomIds: string[];
}

export default function CountdownEventCard({
  event,
  onEdit,
  onDelete,
  formatCountdown,
  existingCustomIds,
}: CountdownEventCardProps) {
  // State for edit form
  const [isEditing, setIsEditing] = useState(false);
  const [editingDescription, setEditingDescription] = useState("");

  const handleEditClick = (description: string) => {
    setEditingDescription(description);
    setIsEditing(true);
  };

  const handleDeleteClick = (description: string) => {
    onDelete(event.id, description);
  };

  return (
    <>
      <Card
        sx={{
          height: 200,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardHeader
          title={formatCountdown(event.id, event.isCustomId)}
          subheader={event.isCustomId ? event.id : event.id.replace(/-/g, "/")}
        />
        <CardContent
          sx={{
            overflowY: "auto",
          }}
        >
          {event.descriptions.map((description, index) => (
            <Stack
              key={index}
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
                  onClick={() => handleEditClick(description)}
                  sx={{ padding: "4px" }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  aria-label="delete"
                  onClick={() => handleDeleteClick(description)}
                  sx={{ padding: "4px" }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          ))}
        </CardContent>
      </Card>

      <EditCountdownDialog
        open={isEditing}
        onClose={() => setIsEditing(false)}
        onSubmit={R.curry(onEdit)(event.id, editingDescription)}
        dateId={event.id}
        description={editingDescription}
        isCustomId={event.isCustomId}
        existingCustomIds={existingCustomIds}
      />
    </>
  );
}

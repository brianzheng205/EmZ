"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
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
  // eslint-disable-next-line no-unused-vars
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
      <Card sx={{ position: "relative" }}>
        <CardHeader
          title={formatCountdown(event.id, event.isCustomId)}
          subheader={event.isCustomId ? event.id : event.id.replace(/-/g, "/")}
        />
        <CardContent>
          {event.descriptions.map((description, index) => (
            <Stack
              key={index}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="body1" gutterBottom>
                {description}
              </Typography>
              <Box>
                <IconButton
                  aria-label="edit"
                  onClick={() => handleEditClick(description)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  aria-label="delete"
                  onClick={() => handleDeleteClick(description)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
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

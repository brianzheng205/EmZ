"use client";

import { useState } from "react";

import {
  Box,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import EditCountdownDialog from "./EditCountdownDialog";

import { CountdownEvent, EditEventFn, DeleteEventFn } from "../../types";
import * as R from "ramda";

export default function CountdownEventCard(props: {
  event: CountdownEvent;
  onEdit: EditEventFn;
  onDelete: DeleteEventFn;
  formatCountdown: (id: string, isCustomId?: boolean) => string;
  existingCustomIds: string[];
}) {
  // State for edit form
  const [isEditing, setIsEditing] = useState(false);
  const [editingDescription, setEditingDescription] = useState("");

  const handleEditClick = (description: string) => {
    setEditingDescription(description);
    setIsEditing(true);
  };

  const handleDeleteClick = (description: string) => {
    props.onDelete(props.event.id, description);
  };

  return (
    <>
      <Card sx={{ position: "relative" }}>
        <CardHeader
          title={props.formatCountdown(props.event.id, props.event.isCustomId)}
          subheader={
            props.event.isCustomId
              ? props.event.id
              : props.event.id.replace(/-/g, "/")
          }
        />
        <CardContent>
          {props.event.descriptions.map((description, index) => (
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
        onSubmit={R.curry(props.onEdit)(props.event.id, editingDescription)}
        dateId={props.event.id}
        description={editingDescription}
        isCustomId={props.event.isCustomId}
        existingCustomIds={props.existingCustomIds}
      />
    </>
  );
}

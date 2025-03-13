"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CountdownDialog from "./CountdownDialog";
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

  // State for menu
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = R.isNotNil(menuAnchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleEditClick = (description: string) => {
    setEditingDescription(description);
    setIsEditing(true);
    handleMenuClose();
  };

  const handleDeleteClick = (description: string) => {
    props.onDelete(props.event.id, description);
    handleMenuClose();
  };

  return (
    <>
      <Card>
        <CardHeader
          title={props.formatCountdown(props.event.id, props.event.isCustomId)}
          subheader={
            props.event.isCustomId
              ? props.event.id
              : props.event.id.replace(/-/g, "/")
          }
          action={
            <IconButton
              aria-label="settings"
              onClick={handleMenuClick}
              sx={{ marginLeft: "auto" }}
            >
              <MoreVertIcon />
            </IconButton>
          }
        />
        <CardContent>
          {props.event.descriptions.map((description, index) => (
            <Typography key={index} variant="body1" gutterBottom>
              {description}
            </Typography>
          ))}
        </CardContent>
      </Card>

      <Menu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {props.event.descriptions.map((description, index) => (
          <Box key={index}>
            <MenuItem onClick={() => handleEditClick(description)}>
              <EditIcon sx={{ mr: 1 }} />
              Edit "{description}"
            </MenuItem>
            <MenuItem onClick={() => handleDeleteClick(description)}>
              <DeleteIcon sx={{ mr: 1 }} />
              Delete "{description}"
            </MenuItem>
          </Box>
        ))}
      </Menu>

      <CountdownDialog
        open={isEditing}
        onClose={() => setIsEditing(false)}
        onEdit={props.onEdit}
        dateId={props.event.id}
        description={editingDescription}
        isCustomId={props.event.isCustomId}
        existingCustomIds={props.existingCustomIds}
      />
    </>
  );
}

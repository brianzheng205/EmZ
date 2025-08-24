"use client";

import { Add } from "@mui/icons-material";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { FbEvent } from "@shared/countdown/types";
import { getDocs } from "firebase/firestore";
import * as R from "ramda";
import { useState, useEffect, useMemo } from "react";

import CenteredLoader from "@/components/CenteredLoader";
import {
  AddEventFn,
  DeleteEventFn,
  Event,
  GroupedEvents,
  UpdateEventFn,
} from "@/countdown/types";

import AddCountdownDialog from "./dialogs/AddEventDialog";
import EventGroupCard from "./EventGroupCard";
import {
  EVENTS_REF,
  addEvent,
  updateEvent,
  deleteEvent,
} from "./firebaseUtils";
import { getSortedDates } from "./utils";

export default function CountdownPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [isAddingCountdown, setIsAddingCountdown] = useState(false);

  const groupedEvents = useMemo(
    () => R.groupBy((event) => event.date, events) as GroupedEvents,
    [events]
  );

  useEffect(() => {
    const fetchEvents = async () => {
      const querySnapshot = await getDocs(EVENTS_REF);
      const fetchedEvents = querySnapshot.docs.map((doc) => {
        const eventData = doc.data() as FbEvent;
        return {
          ...eventData,
          id: doc.id,
        } as Event;
      });
      setEvents(fetchedEvents);
    };

    setLoading(true);
    fetchEvents();
    setLoading(false);
  }, []);

  const handleAddEvent: AddEventFn = async (date, repeatFreq, description) => {
    const updaterFn = await addEvent(date, repeatFreq, description);
    setEvents(updaterFn);
  };

  const handleUpdateEvent: UpdateEventFn = async (
    id,
    date,
    repeatFreq,
    description
  ) => {
    const updaterFn = await updateEvent(id, date, repeatFreq, description);
    setEvents(updaterFn);
  };

  const handleDeleteEvent: DeleteEventFn = async (id: string) => {
    const updaterFn = await deleteEvent(id);
    setEvents(updaterFn);
  };

  return (
    <Container sx={{ height: "100%", padding: 2 }}>
      {loading ? (
        <CenteredLoader />
      ) : (
        <Stack sx={{ height: "100%", gap: 2 }}>
          <Stack
            sx={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 2,
              alignItems: "center",
            }}
          >
            <Button
              startIcon={<Add />}
              onClick={() => setIsAddingCountdown(true)}
            >
              Add
            </Button>
          </Stack>

          {R.isEmpty(events) ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Typography variant="h2">
                No events yet. Add one to get started!
              </Typography>
            </Box>
          ) : (
            getSortedDates(groupedEvents).map((date, index) => (
              <EventGroupCard
                key={index}
                date={date}
                events={groupedEvents[date]}
                onEditSubmit={handleUpdateEvent}
                onDelete={handleDeleteEvent}
              />
            ))
          )}

          <AddCountdownDialog
            open={isAddingCountdown}
            onClose={() => setIsAddingCountdown(false)}
            onSubmit={handleAddEvent}
          />
        </Stack>
      )}
    </Container>
  );
}

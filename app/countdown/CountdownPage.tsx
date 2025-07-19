"use client";

import { Add } from "@mui/icons-material";
import { Button, Container, Stack } from "@mui/material";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useState, useEffect, useCallback } from "react";

import CenteredLoader from "@/components/CenteredLoader";
import { CountdownEvent, SubmitEventFn, EditEventFn } from "@/types";
import { getAdjustedDate } from "@/utils";
import db from "@firebase";

import AddCountdownDialog from "./AddCountdownDialog";
import CountdownEventCard from "./CountdownEventCard";

// Helper function to format date string (MM-DD-YYYY)
function getDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
}

export default function CountdownPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CountdownEvent[]>([]);
  const [isAddingCountdown, setIsAddingCountdown] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const eventsRef = collection(db, "countdowns");
    const querySnapshot = await getDocs(eventsRef);

    const fetchedEvents: CountdownEvent[] = [];

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      fetchedEvents.push({
        id: doc.id,
        descriptions: data.descriptions || [],
        isCustomId: data.isCustomId,
      });
    });

    // Sort events: custom IDs first, then dates
    fetchedEvents.sort((a, b) => {
      // Custom IDs go last
      if (a.isCustomId && !b.isCustomId) return 1;
      if (!a.isCustomId && b.isCustomId) return -1;

      // If both are custom IDs, sort alphabetically
      if (a.isCustomId && b.isCustomId) {
        return a.id.localeCompare(b.id);
      }

      // If both are dates, sort chronologically
      const [monthA, dayA, yearA] = a.id.split("-").map(Number);
      const [monthB, dayB, yearB] = b.id.split("-").map(Number);

      // Compare years first
      if (yearA !== yearB) return yearA - yearB;
      // Then months
      if (monthA !== monthB) return monthA - monthB;
      // Then days
      return dayA - dayB;
    });

    setEvents(fetchedEvents);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const addEvent: SubmitEventFn = async (id, description, isCustomId) => {
    if (!isCustomId) {
      const date = new Date(id);
      const adjustedDate = getAdjustedDate(date);
      id = getDateString(adjustedDate);
    }

    const docRef = doc(db, "countdowns", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Add description to existing date/id
      await updateDoc(docRef, {
        descriptions: arrayUnion(description),
        isCustomId,
      });
    } else {
      // Create new document
      await setDoc(docRef, {
        descriptions: [description],
        isCustomId,
      });
    }

    fetchEvents();
  };

  const editEvent: EditEventFn = async (
    oldId,
    oldDescription,
    newId,
    newDescription,
    isCustomId
  ) => {
    // Remove from old ID
    const oldDocRef = doc(db, "countdowns", oldId);
    const oldDocSnap = await getDoc(oldDocRef);

    if (oldDocSnap.exists()) {
      const descriptions = oldDocSnap.data().descriptions;
      if (descriptions.length === 1) {
        // If this was the only description, delete the document
        await deleteDoc(oldDocRef);
      } else {
        // Remove the old description
        await updateDoc(oldDocRef, {
          descriptions: arrayRemove(oldDescription),
        });
      }
    }

    // Format new ID if it's a date
    if (!isCustomId) {
      const date = new Date(newId);
      const adjustedDate = getAdjustedDate(date);
      newId = getDateString(adjustedDate);
    }

    // Add to new ID
    const newDocRef = doc(db, "countdowns", newId);
    const newDocSnap = await getDoc(newDocRef);

    if (newDocSnap.exists()) {
      // Add description to existing date/id
      await updateDoc(newDocRef, {
        descriptions: arrayUnion(newDescription),
        isCustomId,
      });
    } else {
      // Create new document
      await setDoc(newDocRef, {
        descriptions: [newDescription],
        isCustomId,
      });
    }

    fetchEvents();
  };

  const deleteEvent = async (dateId: string, description: string) => {
    try {
      const docRef = doc(db, "countdowns", dateId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentDescriptions = docSnap.data().descriptions;

        if (currentDescriptions.length === 1) {
          // If this is the last description, delete the whole document
          await deleteDoc(docRef);
        } else {
          // Remove just this description
          await updateDoc(docRef, {
            descriptions: arrayRemove(description),
          });
        }

        fetchEvents();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const formatCountdown = (id: string, isCustomId?: boolean) => {
    if (isCustomId) return id;

    // Parse the date from ID (MM-DD-YYYY)
    const [month, day, year] = id.split("-").map(Number);
    const date = new Date(year, month - 1, day); // month is 0-based

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate days difference
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "TODAY";
    if (diffDays < 0) return "PAST";
    return `D-${diffDays}`;
  };

  const getExistingCustomIds = () => {
    return events.filter((event) => event.isCustomId).map((event) => event.id);
  };

  return (
    <Container sx={{ minHeight: "100%", padding: 2 }}>
      {loading ? (
        <CenteredLoader />
      ) : (
        <Stack sx={{ gap: 2 }}>
          <Stack
            sx={{
              flexDirection: "row-reverse",
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

          {events.map((event, index) => (
            <CountdownEventCard
              key={index}
              event={event}
              onEdit={editEvent}
              onDelete={deleteEvent}
              formatCountdown={formatCountdown}
              existingCustomIds={getExistingCustomIds()}
            />
          ))}

          <AddCountdownDialog
            open={isAddingCountdown}
            onClose={() => setIsAddingCountdown(false)}
            onSubmit={addEvent}
            existingCustomIds={getExistingCustomIds()}
          />
        </Stack>
      )}
    </Container>
  );
}

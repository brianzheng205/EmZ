"use client";

import { Chip, Skeleton, Stack, Typography } from "@mui/material";
import { getDocs } from "firebase/firestore";
import * as R from "ramda";
import { useEffect, useState } from "react";

import { FbEvent } from "@shared/countdown/types";
import { toDate } from "shared/utils";

import { EVENTS_REF } from "./firebaseUtils";
import { Event, GroupedEvents } from "./types";
import { getSortedDates } from "./utils";

const daysUntil = (dateStr: string): number | null => {
  const date = toDate(dateStr);
  if (date === null) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export default function CountdownWidget() {
  const [loading, setLoading] = useState(true);
  const [groupedEvents, setGroupedEvents] = useState<GroupedEvents>({});

  useEffect(() => {
    let cancelled = false;

    getDocs(EVENTS_REF)
      .then((snapshot) => {
        if (cancelled) return;

        const events = snapshot.docs.map(
          (doc) => ({ ...(doc.data() as FbEvent), id: doc.id }) as Event,
        );
        setGroupedEvents(R.groupBy((event) => event.date, events) as GroupedEvents);
      })
      .catch((error) => console.error("Error fetching countdown widget data:", error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Skeleton variant="rounded" height={48} />;

  const upcomingDate = getSortedDates(groupedEvents).find((date) => {
    const days = daysUntil(date);
    return days === null || days >= 0;
  });

  if (!upcomingDate) {
    return (
      <Typography variant="body2" color="text.secondary">
        No upcoming events.
      </Typography>
    );
  }

  const events = groupedEvents[upcomingDate];
  const days = daysUntil(upcomingDate);
  const label = days === null ? "D-∞" : days === 0 ? "Today" : `D-${days}`;

  return (
    <Stack sx={{ gap: 0.5 }}>
      <Stack direction="row" alignItems="baseline" spacing={1}>
        <Typography variant="h5" fontWeight={700} color="primary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={600} noWrap>
          {events[0].description}
        </Typography>
      </Stack>
      {events.length > 1 && (
        <Chip
          size="small"
          label={`+${events.length - 1} more that day`}
          sx={{ alignSelf: "flex-start" }}
        />
      )}
    </Stack>
  );
}

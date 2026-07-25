"use client";

import { Skeleton, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { fetchAllDates } from "./firebaseUtils";
import { PlannerDate } from "./types";

export default function DatesWidget() {
  const [loading, setLoading] = useState(true);
  const [nextDate, setNextDate] = useState<PlannerDate | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchAllDates()
      .then((dates) => {
        if (cancelled) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = Object.values(dates)
          .filter((date) => date.date >= today)
          .sort((a, b) => a.date.getTime() - b.date.getTime());

        setNextDate(upcoming[0] || null);
      })
      .catch((error) => console.error("Error fetching dates widget data:", error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Skeleton variant="rounded" height={48} />;

  if (!nextDate) {
    return (
      <Typography variant="body2" color="text.secondary">
        No upcoming dates planned.
      </Typography>
    );
  }

  return (
    <Stack sx={{ gap: 0.25 }}>
      <Typography variant="body2" fontWeight={700} noWrap>
        {nextDate.name}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {nextDate.date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        })}
      </Typography>
    </Stack>
  );
}

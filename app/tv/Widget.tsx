"use client";

import { Chip, Skeleton, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import ContentPoster from "@/components/ContentPoster";
import { ContentStatus, EmZContent } from "@shared/tv/types";

import { fetchAllContentFromFirebase } from "./firebaseUtils";

export default function TVWidget() {
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState<EmZContent | null>(null);
  const [queuedCount, setQueuedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchAllContentFromFirebase()
      .then((snapshot) => {
        if (cancelled) return;

        const rows = snapshot.docs.map((doc) => doc.data() as EmZContent);
        const inProgress = rows.filter(
          (row) => ContentStatus.calculate(row) === ContentStatus.IN_PROGRESS,
        );
        const notStarted = rows.filter(
          (row) => ContentStatus.calculate(row) === ContentStatus.NOT_STARTED,
        );

        setCurrent(inProgress[0] || null);
        setQueuedCount(notStarted.length);
      })
      .catch((error) => console.error("Error fetching TV widget data:", error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Skeleton variant="rounded" height={62} />;

  if (!current) {
    return (
      <Typography variant="body2" color="text.secondary">
        {queuedCount > 0
          ? `${queuedCount} show${queuedCount === 1 ? "" : "s"} queued up.`
          : "Nothing being watched right now."}
      </Typography>
    );
  }

  const title = current.media_type === "movie" ? current.title : current.name;

  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <ContentPoster
        posterPath={current.poster_path}
        title={title}
        mediaType={current.media_type}
        height={62}
        width={44}
        hideTitle
        sx={{ borderRadius: 2, flexShrink: 0 }}
      />
      <Stack sx={{ gap: 0.25, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={700} noWrap>
          {title}
        </Typography>
        <Chip size="small" label="in progress" sx={{ alignSelf: "flex-start" }} />
      </Stack>
    </Stack>
  );
}

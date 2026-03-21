import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  IconButton,
  Chip,
  Stack,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
} from "@mui/material";
import { useState } from "react";

import CircularProgressWithLabel from "@/components/CircularProgressWithLabel";

import {
  EmZContent,
  EmZGenre,
  whoOptions,
  NextEpisodeToAir,
  Provider,
  ContentStatus,
} from "./utils";

interface TVCardProps {
  item: EmZContent & { watched_name?: string | null };
  genres: Record<number, EmZGenre> | null;
  providers: Provider[];
  onUpdate: (updatedItem: EmZContent) => Promise<void>;
  onDelete: (id: number) => void;
}

export default function TVCard({
  item,
  genres,
  providers,
  onUpdate,
  onDelete,
}: TVCardProps) {
  const [whoAnchorEl, setWhoAnchorEl] = useState<null | HTMLElement>(null);

  const title = item.media_type === "movie" ? item.title : item.name;
  const progress = item.episodes > 0 ? (item.watched * 100) / item.episodes : 0;
  const status = ContentStatus.calculate(item);
  const airedCount = ContentStatus.getAiredCount(item);
  const airedProgress =
    item.episodes > 0 ? (airedCount * 100) / item.episodes : 0;

  const nextAirDate = (() => {
    let date: Date | null = null;
    if (item.media_type === "tv" && item.next_episode_to_air) {
      date = new Date(
        (item.next_episode_to_air as NextEpisodeToAir).air_date + "T00:00:00",
      );
    } else if (item.media_type === "movie" && item.release_date) {
      date = new Date(item.release_date + "T00:00:00");
    }

    if (date && date >= new Date(new Date().setHours(0, 0, 0, 0))) {
      return date;
    }
    return null;
  })();

  const handleWatchedChange = (newWatched: number) => {
    if (newWatched >= 0 && newWatched <= item.episodes) {
      onUpdate({ ...item, watched: newWatched });
    }
  };

  const currentProviders = Object.keys(item.watch_providers || {})
    .filter((key) => key !== "link")
    .flatMap((buyType) => {
      const providersObj = item.watch_providers as unknown as Record<
        string,
        Provider[]
      >;
      const providerList = providersObj ? providersObj[buyType] || [] : [];
      return providerList.filter(
        (provider: Provider) =>
          buyType === "free" ||
          buyType === "ads" ||
          providers.some((p) => p.provider_id === provider.provider_id),
      );
    })
    .filter(
      (v, i, a) => a.findIndex((t) => t.provider_id === v.provider_id) === i,
    )
    .sort((a, b) => {
      const getProviderOrder = ({ provider_id }: Provider) => {
        const matchesId = (p: Provider) => p.provider_id === provider_id;

        if (providers.some(matchesId)) return 1;
        if (item.watch_providers?.free?.some(matchesId)) return 2;
        if (item.watch_providers?.ads?.some(matchesId)) return 3;

        return 4;
      };
      return getProviderOrder(a) - getProviderOrder(b);
    });

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper", // Themed peach paper background
        borderRadius: 3,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        height: "100%",
        position: "relative",
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="300"
          image={
            item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : "/favicon.png"
          }
          alt={title}
          sx={{ objectFit: "cover" }}
        />

        {/* Status Chip */}
        <Chip
          label={status.name}
          size="small"
          color={
            status === ContentStatus.COMPLETED
              ? "success"
              : status === ContentStatus.CAUGHT_UP
                ? "secondary"
                : status === ContentStatus.IN_PROGRESS
                  ? "info"
                  : "default"
          }
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            fontWeight: "bold",
            ...(status === ContentStatus.NOT_STARTED && {
              bgcolor: "rgba(255, 255, 255, 0.9)",
              color: "rgba(0, 0, 0, 0.87)",
            }),
            ...(status === ContentStatus.CAUGHT_UP && {
              boxShadow: "0 0 8px rgba(156, 39, 176, 0.4)", // Subtle glow for caught up
            }),
          }}
        />

        {/* Complete Toggle Button */}
        <IconButton
          size="small"
          onClick={() =>
            onUpdate({
              ...item,
              override_as_complete: !item.override_as_complete,
            })
          }
          sx={{
            position: "absolute",
            top: 8,
            right: 44,
            bgcolor: item.override_as_complete
              ? "success.main"
              : "rgba(255,255,255,0.7)",
            color: item.override_as_complete ? "white" : "success.main",
            "&:hover": {
              bgcolor: item.override_as_complete ? "success.dark" : "white",
            },
            boxShadow: item.override_as_complete
              ? "0 0 8px rgba(76, 175, 80, 0.5)"
              : "none",
          }}
          title={
            item.override_as_complete
              ? "Mark as Incomplete"
              : "Mark as Complete"
          }
        >
          {item.override_as_complete ? (
            <CheckCircleIcon fontSize="small" />
          ) : (
            <CheckCircleOutlineIcon fontSize="small" />
          )}
        </IconButton>

        {/* Delete Button */}
        <IconButton
          size="small"
          onClick={() => onDelete(item.id)}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: "rgba(255,255,255,0.7)",
            "&:hover": { bgcolor: "white" },
          }}
        >
          <DeleteIcon fontSize="small" color="error" />
        </IconButton>
      </Box>

      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          pb: "16px !important",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ lineHeight: 1.2, color: "primary.main" }}
          >
            {title}
          </Typography>
          <Box sx={{ ml: 1 }}>
            <CircularProgressWithLabel value={progress} size={40} />
          </Box>
        </Box>

        {/* Genres */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {item.genre_ids?.map((id) => {
            const genre = genres?.[id];
            return genre ? (
              <Chip
                key={id}
                label={genre.name}
                size="small"
                sx={{ bgcolor: genre.color, fontSize: "0.7rem", height: 20 }}
              />
            ) : null;
          })}
        </Box>

        <Box
          sx={{ mt: "auto", display: "flex", flexDirection: "column", gap: 1 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Watched: {item.watched} / {item.episodes}
            </Typography>
            <Box>
              <IconButton
                size="small"
                onClick={() => handleWatchedChange(item.watched - 1)}
                disabled={item.watched <= 0}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleWatchedChange(item.watched + 1)}
                disabled={
                  status === ContentStatus.COMPLETED ||
                  status === ContentStatus.CAUGHT_UP
                }
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ position: "relative", mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: "background.default",
                "& .MuiLinearProgress-bar": {
                  bgcolor: "primary.main",
                },
              }}
            />
            {item.media_type === "tv" &&
              airedProgress > 0 &&
              airedProgress < 100 && (
                <Box
                  sx={{
                    position: "absolute",
                    left: `${airedProgress}%`,
                    top: -2,
                    bottom: -2,
                    width: 2,
                    bgcolor: "secondary.main",
                    zIndex: 1,
                    borderRadius: 1,
                    opacity: 0.8,
                    boxShadow: "0 0 4px rgba(0,0,0,0.2)",
                    pointerEvents: "none", // Prevent marker from blocking clicks
                  }}
                  title={`Aired episodes: ${airedCount}`}
                />
              )}
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" fontWeight="medium">
              For:
            </Typography>
            <Chip
              label={item.who}
              size="small"
              onClick={(e) => setWhoAnchorEl(e.currentTarget)}
              sx={{
                bgcolor:
                  item.who === "Emily"
                    ? "primary.main"
                    : item.who === "Brian"
                      ? "secondary.main"
                      : "default",
                color: item.who === "Both" ? "inherit" : "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            />
            <Menu
              anchorEl={whoAnchorEl}
              open={Boolean(whoAnchorEl)}
              onClose={() => setWhoAnchorEl(null)}
            >
              {whoOptions.map((option) => (
                <MenuItem
                  key={option}
                  onClick={() => {
                    onUpdate({ ...item, who: option });
                    setWhoAnchorEl(null);
                  }}
                  selected={item.who === option}
                >
                  {option}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Providers */}
          {currentProviders.length > 0 && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
                justifyContent: "flex-end",
                maxWidth: "60%",
              }}
            >
              {currentProviders.map((provider: Provider, idx) => (
                <Tooltip key={idx} title={provider.provider_name}>
                  <Avatar
                    variant="rounded"
                    src={`https://image.tmdb.org/t/p/w200${provider.logo_path}`}
                    sx={{ width: 24, height: 24 }}
                  />
                </Tooltip>
              ))}
            </Box>
          )}
        </Box>

        {nextAirDate && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.5 }}
          >
            Next: {nextAirDate.toLocaleDateString()}
            {nextAirDate.toDateString() === new Date().toDateString()
              ? " (TODAY)"
              : ""}
          </Typography>
        )}
        {item.watched_name && (
          <Box
            sx={{
              mt: 0.5,
              pt: 1,
              borderTop: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography
              variant="caption"
              fontWeight="bold"
              color="text.secondary"
              sx={{ whiteSpace: "nowrap" }}
            >
              Last watched:
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontStyle: "italic",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                flex: 1,
              }}
            >
              {item.watched_name}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

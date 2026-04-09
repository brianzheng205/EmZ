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
  Select,
  FormControl,
  ListSubheader,
  Skeleton,
} from "@mui/material";
import { useState, useEffect } from "react";

import ContentPoster from "@/components/ContentPoster";
import CircularProgressWithLabel from "@/components/CircularProgressWithLabel";

import {
  EmZContent,
  EmZGenre,
  whoOptions,
  NextEpisodeToAir,
  Provider,
  ContentStatus,
  fetchDataFromTMDB,
  Season,
} from "./utils";

interface TVCardProps {
  item: EmZContent;
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
  const [seasonEpisodes, setSeasonEpisodes] = useState<Record<number, any[]>>(
    {},
  );
  const [fetchingSeasons, setFetchingSeasons] = useState<Set<number>>(
    new Set(),
  );

  const title = item.media_type === "movie" ? item.title : item.name;
  const airedCount = ContentStatus.getAiredCount(item);
  const status = ContentStatus.calculate(item, airedCount);
  const numEpisodes = Math.max(item.episodes, airedCount);
  const progress = numEpisodes > 0 ? (item.watched * 100) / numEpisodes : 0;
  const airedProgress = numEpisodes > 0 ? (airedCount * 100) / numEpisodes : 0;

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

  const nonSpecialSeasons = (item.seasons || [])
    .filter((s) => s.season_number > 0)
    .sort((a, b) => a.season_number - b.season_number);

  const { currentSeason, currentEpisode } = (() => {
    if (item.watched === 0) {
      return { currentSeason: null, currentEpisode: null };
    }

    let watchedRemaining = item.watched;
    let currS: Season | null = null;
    let currE = 0;

    for (const season of nonSpecialSeasons) {
      if (watchedRemaining <= season.episode_count) {
        currS = season;
        currE = watchedRemaining;
        break;
      }
      watchedRemaining -= season.episode_count;
    }

    if (!currS && nonSpecialSeasons.length > 0) {
      currS = nonSpecialSeasons[nonSpecialSeasons.length - 1];
      currE = currS.episode_count;
    }

    return { currentSeason: currS, currentEpisode: currE };
  })();

  const fetchSeason = async (seasonNum: number) => {
    if (seasonEpisodes[seasonNum] || fetchingSeasons.has(seasonNum)) return;

    setFetchingSeasons((prev) => new Set(prev).add(seasonNum));
    const url = `https://api.themoviedb.org/3/tv/${item.id}/season/${seasonNum}?language=en-US`;
    const result = await fetchDataFromTMDB(url);

    if (result && result.episodes) {
      setSeasonEpisodes((prev) => ({ ...prev, [seasonNum]: result.episodes }));
    }
    setFetchingSeasons((prev) => {
      const next = new Set(prev);
      next.delete(seasonNum);
      return next;
    });
  };

  useEffect(() => {
    if (item.media_type === "tv" && currentSeason) {
      fetchSeason(currentSeason.season_number);
    }
  }, [item.media_type, item.id, currentSeason?.season_number]);

  const handleWatchedChange = (newWatched: number) => {
    if (newWatched >= 0 && newWatched <= numEpisodes) {
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
        <ContentPoster
          posterPath={item.poster_path}
          title={title}
          mediaType={item.media_type}
          height={300}
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
            <CircularProgressWithLabel
              value={progress}
              size={40}
              status={status}
            />
          </Box>
        </Box>

        {/* Genres */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {item.genres?.map((g) => {
            const color =
              genres?.[g.id]?.color || `hsl(${(g.id * 50) % 360}, 70%, 80%)`;
            return (
              <Chip
                key={g.id}
                label={g.name}
                size="small"
                sx={{ bgcolor: color, fontSize: "0.7rem", height: 20 }}
              />
            );
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
            {item.media_type === "tv" && nonSpecialSeasons.length > 0 ? (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    Watched: {item.watched} / {numEpisodes}
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
                <Box sx={{ display: "flex", gap: 2 }}>
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <Select
                      value={item.watched}
                      onChange={(e) =>
                        handleWatchedChange(Number(e.target.value))
                      }
                      displayEmpty
                      renderValue={(selected: any) => {
                        const watchedValue = Number(selected);
                        if (watchedValue === 0) {
                          return (
                            <Typography
                              noWrap
                              variant="body2"
                              color="text.secondary"
                            >
                              Not Started
                            </Typography>
                          );
                        }

                        if (currentSeason && currentEpisode !== null) {
                          const epDataArr =
                            seasonEpisodes[currentSeason.season_number];
                          const epData = epDataArr?.find(
                            (ep) => ep.episode_number === currentEpisode,
                          );

                          if (!epData) {
                            return (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  width: "100%",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ whiteSpace: "nowrap" }}
                                >
                                  S{currentSeason.season_number} E
                                  {currentEpisode} -
                                </Typography>
                                <Skeleton variant="text" width={80} />
                              </Box>
                            );
                          }

                          const fullText = `S${currentSeason.season_number} E${currentEpisode} - ${epData.name}`;
                          return (
                            <Tooltip title={fullText} placement="top" arrow>
                              <Box sx={{ width: "100%", overflow: "hidden" }}>
                                <Typography
                                  noWrap
                                  variant="body2"
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {fullText}
                                </Typography>
                              </Box>
                            </Tooltip>
                          );
                        }
                        return (
                          <Typography noWrap variant="body2">
                            Watched: {watchedValue}
                          </Typography>
                        );
                      }}
                      sx={{
                        borderRadius: 2,
                        bgcolor: "rgba(255, 255, 255, 0.4)",
                        backdropFilter: "blur(4px)",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "transparent",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "primary.main",
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 400,
                            maxWidth: 350,
                          },
                        },
                        MenuListProps: {
                          sx: {
                            mt: 1,
                          },
                        },
                      }}
                      onOpen={() => {
                        if (item.media_type === "tv") {
                          nonSpecialSeasons.forEach((s) =>
                            fetchSeason(s.season_number),
                          );
                        }
                      }}
                    >
                      <MenuItem
                        value={0}
                        sx={{ fontStyle: "italic", color: "text.secondary" }}
                      >
                        Not Started
                      </MenuItem>
                      {(() => {
                        let absCount = 0;
                        return nonSpecialSeasons.flatMap((s) => {
                          const items = [
                            <ListSubheader
                              key={`s${s.season_number}`}
                              sx={{
                                bgcolor: "background.paper",
                                color: "primary.main",
                                fontWeight: "bold",
                                lineHeight: "28px",
                                mt: 2,
                                mb: 0.5,
                                textAlign: "center",
                                fontSize: "0.75rem",
                                textTransform: "uppercase",
                                letterSpacing: 1,
                                pointerEvents: "none",
                              }}
                            >
                              Season {s.season_number}
                            </ListSubheader>,
                          ];

                          for (let e = 1; e <= s.episode_count; e++) {
                            absCount++;
                            const currentAbs = absCount;
                            const hasAired = currentAbs <= airedCount;
                            const epDataArr = seasonEpisodes[s.season_number];
                            const epData = epDataArr?.find(
                              (ep) => ep.episode_number === e,
                            );
                            const epName =
                              epData && epData.name ? ` - ${epData.name}` : "";

                            items.push(
                              <MenuItem
                                key={`abs-${currentAbs}`}
                                value={currentAbs}
                                disabled={!hasAired}
                                sx={{
                                  whiteSpace: "normal",
                                  wordBreak: "break-word",
                                  color: hasAired ? "inherit" : "text.disabled",
                                  fontStyle: hasAired ? "normal" : "italic",
                                  fontSize: "0.875rem",
                                  py: 0.5,
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 0,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ mr: 0.5, whiteSpace: "nowrap" }}
                                >
                                  S{s.season_number} E{e} -
                                </Typography>
                                {epData ? (
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {epData.name}
                                  </Typography>
                                ) : (
                                  <Skeleton
                                    variant="text"
                                    width={100}
                                    sx={{ mt: 0.5 }}
                                  />
                                )}
                              </MenuItem>,
                            );
                          }
                          return items;
                        });
                      })()}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            ) : (
              // Simple UI for movies or things with no seasons
              <>
                <Typography variant="body2" color="text.secondary">
                  Watched: {item.watched} / {numEpisodes}
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
              </>
            )}
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

            {item.media_type === "tv" && airedCount > item.watched && (
              <Tooltip
                title={`${airedCount - item.watched} episode${airedCount - item.watched === 1 ? "" : "s"} to catch up`}
                placement="top"
                arrow
              >
                <Box
                  sx={{
                    position: "absolute",
                    left: `${progress}%`,
                    width: `${airedProgress - progress}%`,
                    top: -4,
                    bottom: -4,
                    zIndex: 2,
                    cursor: "help",
                    "&:hover": {
                      bgcolor: "secondary.main",
                      opacity: 0.3,
                      borderRadius: 1,
                    },
                  }}
                />
              </Tooltip>
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

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mt: 0.5,
            visibility: nextAirDate ? "visible" : "hidden",
            minHeight: "20px",
          }}
        >
          {nextAirDate ? (
            <>
              Next: {nextAirDate.toLocaleDateString()}
              {nextAirDate.toDateString() === new Date().toDateString()
                ? " (TODAY)"
                : ""}
            </>
          ) : (
            "\\u00A0"
          )}
        </Typography>
      </CardContent>
    </Card>
  );
}

import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Typography,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { GridRowsProp } from "@mui/x-data-grid";
import { useState } from "react";

import ContentPoster from "@/components/ContentPoster";
import { addContentToFirebase } from "./firebaseUtils";
import { EmZContent, getGenreColor } from "./utils";

type NextShowProps = {
  rows: GridRowsProp;
};

export default function NextShow({ rows }: NextShowProps) {
  const [open, setOpen] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Filters State
  const [whoFilters, setWhoFilters] = useState<string[]>([]);
  const [typeFilters, setTypeFilters] = useState<string[]>([]); // Default all off
  const [genreFilters, setGenreFilters] = useState<string[]>([]);

  const [selectedContent, setSelectedContent] = useState<EmZContent | null>(
    null,
  );

  // Extract all unique genres from shows
  const uniqueGenres = Array.from(
    new Map(
      (rows as EmZContent[])
        .flatMap((row) => row.genres || [])
        .map((genre) => [genre.id, genre]),
    ).values(),
  ).sort((a, b) => a.name.localeCompare(b.name));

  const handleRoll = () => {
    let filtered = [...(rows as EmZContent[])];

    // 1. Filter by Status (Only include shows that are not started and not completed)
    filtered = filtered.filter(
      (item) => item.watched === 0 && !item.override_as_complete,
    );

    // 2. Filter by Who
    if (whoFilters.length > 0) {
      filtered = filtered.filter((item) => whoFilters.includes(item.who));
    }

    // 3. Filter by Media Type
    if (typeFilters.length > 0) {
      filtered = filtered.filter((item) => typeFilters.includes(item.media_type || ""));
    }

    // 4. Filter by Genre
    if (genreFilters.length > 0) {
      filtered = filtered.filter((item) =>
        item.genres?.some((g) => genreFilters.includes(g.id.toString())),
      );
    }

    if (filtered.length === 0) {
      setSelectedContent(null);
      setErrorMsg("No shows match your current filters. Try relaxing them!");
      return;
    }

    setErrorMsg("");
    setShuffling(true);

    let count = 0;
    const totalSteps = 12;
    const intervalTime = 70; // 70ms step time for rapid shuffling effect

    const interval = setInterval(() => {
      const tempIndex = Math.floor(Math.random() * filtered.length);
      setSelectedContent(filtered[tempIndex]);
      count++;

      if (count >= totalSteps) {
        clearInterval(interval);
        setShuffling(false);
      }
    }, intervalTime);
  };

  const handleStartWatching = async () => {
    if (!selectedContent) return;
    try {
      const updatedWatched =
        selectedContent.watched === 0 ? 1 : selectedContent.watched;
      const updatedItem = {
        ...selectedContent,
        watched: updatedWatched,
      };
      await addContentToFirebase(updatedItem);
      setOpen(false);
    } catch (err) {
      console.error("Failed to start watching show:", err);
    }
  };

  const renderMultiFilterChips = (
    label: string,
    selectedValues: string[],
    onChange: (vals: string[]) => void,
    options: { label: string; value: string }[],
  ) => (
    <Stack direction="column" spacing={0.5} sx={{ width: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" fontWeight="bold" color="primary.main">
          {label}
        </Typography>
        {selectedValues.length > 0 && (
          <Typography
            variant="caption"
            onClick={() => onChange([])}
            sx={{
              cursor: "pointer",
              color: "text.secondary",
              "&:hover": { color: "primary.main" },
            }}
          >
            Clear
          </Typography>
        )}
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
        sx={{ gap: 1 }}
      >
        {options.map((opt) => {
          const isSelected = selectedValues.includes(opt.value);
          return (
            <Chip
              key={opt.value}
              label={opt.label}
              onClick={() => {
                if (isSelected) {
                  onChange(selectedValues.filter((v) => v !== opt.value));
                } else {
                  onChange([...selectedValues, opt.value]);
                }
              }}
              disabled={shuffling}
              sx={{
                fontWeight: isSelected ? "bold" : "normal",
                bgcolor: isSelected
                  ? "primary.main"
                  : "rgba(255, 255, 255, 0.45)",
                color: isSelected ? "white" : "text.primary",
                border: `1px solid ${isSelected ? "transparent" : "rgba(0,0,0,0.06)"}`,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  bgcolor: isSelected
                    ? "primary.dark"
                    : "rgba(255, 255, 255, 0.8)",
                  transform: "translateY(-1px)",
                },
                "&:active": {
                  transform: "translateY(0px)",
                },
              }}
            />
          );
        })}
      </Stack>
    </Stack>
  );

  return (
    <Box>
      <Button
        onClick={() => {
          setOpen(true);
          setSelectedContent(null);
          setErrorMsg("");
        }}
        sx={{
          bgcolor: "primary.main",
          color: "white",
          borderRadius: 2,
          fontWeight: "bold",
          px: 3,
          py: 1,
          boxShadow: "0 4px 12px rgba(144, 76, 119, 0.3)",
          textTransform: "none",
          transition: "all 0.2s",
          "&:hover": {
            bgcolor: "primary.dark",
            transform: "translateY(-1px)",
            boxShadow: "0 6px 16px rgba(144, 76, 119, 0.4)",
          },
        }}
      >
        Choose Next Show
      </Button>

      <Dialog
        open={open}
        onClose={() => {
          if (!shuffling) setOpen(false);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: "background.paper",
            backgroundImage: "none",
            p: 1.5,
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.18)",
          },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              Next Show Picker
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Let us choose your next binge watch! 🎲
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            disabled={shuffling}
            sx={{
              color: (theme) => theme.palette.grey[500],
              "&:hover": { bgcolor: "rgba(0,0,0,0.05)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ border: "none", py: 1 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            {/* Left Column: Settings Panel */}
            <Stack
              spacing={2.5}
              sx={{
                flex: { xs: "none", md: "0 0 42%" },
                bgcolor: "rgba(255, 255, 255, 0.35)",
                backdropFilter: "blur(8px)",
                borderRadius: 3,
                p: 2.5,
                border: "1px solid rgba(255, 255, 255, 0.4)",
                justifyContent: "space-between",
              }}
            >
              <Stack spacing={2}>
                {renderMultiFilterChips("Added By", whoFilters, setWhoFilters, [
                  { label: "Emily", value: "Emily" },
                  { label: "Brian", value: "Brian" },
                  { label: "Both", value: "Both" },
                ])}

                {renderMultiFilterChips("Type", typeFilters, setTypeFilters, [
                  { label: "TV Show", value: "tv" },
                  { label: "Movie", value: "movie" },
                ])}


                <Stack direction="column" spacing={0.5} sx={{ width: "100%" }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="primary.main"
                    >
                      Genre
                    </Typography>
                    {genreFilters.length > 0 && (
                      <Typography
                        variant="caption"
                        onClick={() => setGenreFilters([])}
                        sx={{
                          cursor: "pointer",
                          color: "text.secondary",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        Clear
                      </Typography>
                    )}
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ gap: 1, mt: 0.5 }}
                  >
                    {uniqueGenres.map((g) => {
                      const isSelected = genreFilters.includes(g.id.toString());
                      const color = getGenreColor(g.id);
                      return (
                        <Chip
                          key={g.id}
                          label={g.name}
                          onClick={() => {
                            if (isSelected) {
                              setGenreFilters(
                                genreFilters.filter((v) => v !== g.id.toString()),
                              );
                            } else {
                              setGenreFilters([
                                ...genreFilters,
                                g.id.toString(),
                              ]);
                            }
                          }}
                          disabled={shuffling}
                          sx={{
                            fontWeight: isSelected ? "bold" : "normal",
                            bgcolor: color,
                            color: "text.primary",
                            opacity: isSelected ? 1 : 0.45,
                            border: `2px solid ${isSelected ? "#904C77" : "transparent"}`,
                            boxShadow: isSelected
                              ? "0 2px 6px rgba(144, 76, 119, 0.2)"
                              : "none",
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                              opacity: 0.9,
                              transform: "translateY(-1px)",
                            },
                            "&:active": {
                              transform: "translateY(0px)",
                            },
                          }}
                        />
                      );
                    })}
                  </Stack>
                </Stack>
              </Stack>

              <Button
                variant="contained"
                onClick={handleRoll}
                disabled={shuffling}
                startIcon={<ShuffleIcon />}
                sx={{
                  mt: 2,
                  py: 1.2,
                  borderRadius: 2.5,
                  fontWeight: "bold",
                  fontSize: "1rem",
                  textTransform: "none",
                  background:
                    "linear-gradient(45deg, #904C77 30%, #E49AB0 90%)",
                  boxShadow: "0 4px 14px rgba(144, 76, 119, 0.35)",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 6px 20px rgba(144, 76, 119, 0.5)",
                  },
                }}
              >
                Roll the Dice 🎲
              </Button>
            </Stack>

            {/* Right Column: Matched Result Card */}
            <Box
              sx={{
                flex: { xs: "none", md: "1 1 58%" },
                display: "flex",
                flexDirection: "column",
                bgcolor: "rgba(255, 255, 255, 0.4)",
                borderRadius: 3,
                p: 2.5,
                border: "1px solid rgba(255, 255, 255, 0.5)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.03)",
                position: "relative",
                minHeight: { xs: 260, md: 360 },
                justifyContent: "center",
              }}
            >
              {shuffling && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: "rgba(236, 187, 165, 0.75)",
                    backdropFilter: "blur(4px)",
                    borderRadius: 3,
                    zIndex: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1.5,
                  }}
                >
                  <ShuffleIcon
                    sx={{
                      fontSize: 48,
                      color: "primary.main",
                      animation: "spin 0.8s linear infinite",
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }}
                  />
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    Shuffling candidate shows...
                  </Typography>
                </Box>
              )}

              {errorMsg && (
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.main"
                    gutterBottom
                  >
                    No matches found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {errorMsg}
                  </Typography>
                </Box>
              )}

              {!selectedContent && !errorMsg && !shuffling && (
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <ShuffleIcon
                    sx={{
                      fontSize: 54,
                      color: "primary.main",
                      opacity: 0.6,
                      mb: 1.5,
                    }}
                  />
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.main"
                    gutterBottom
                  >
                    Ready to roll?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configure your preferences on the left and click Roll the
                    Dice!
                  </Typography>
                </Box>
              )}

              {selectedContent && !errorMsg && (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2.5}
                  sx={{ height: "100%" }}
                >
                  <Box sx={{ alignSelf: "center", flexShrink: 0 }}>
                    <ContentPoster
                      posterPath={selectedContent.poster_path}
                      title={
                        selectedContent.name || selectedContent.title || ""
                      }
                      mediaType={selectedContent.media_type}
                      height={250}
                      width={166}
                      sx={{
                        borderRadius: 2,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      }}
                    />
                  </Box>
                  <Stack
                    spacing={1.5}
                    sx={{ flexGrow: 1, justifyContent: "space-between" }}
                  >
                    <Box>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color="primary.main"
                        sx={{ lineHeight: 1.2 }}
                      >
                        {selectedContent.name || selectedContent.title}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mt: 1, mb: 1, flexWrap: "wrap", gap: 0.5 }}
                      >
                        <Chip
                          label={
                            selectedContent.media_type === "tv"
                              ? "TV Show"
                              : "Movie"
                          }
                          size="small"
                          sx={{
                            bgcolor: "rgba(0,0,0,0.06)",
                            fontWeight: "bold",
                            fontSize: "0.72rem",
                          }}
                        />
                        <Chip
                          label={`For: ${selectedContent.who}`}
                          size="small"
                          sx={{
                            bgcolor:
                              selectedContent.who === "Emily"
                                ? "primary.main"
                                : selectedContent.who === "Brian"
                                  ? "secondary.main"
                                  : "rgba(0,0,0,0.06)",
                            color:
                              selectedContent.who === "Both"
                                ? "inherit"
                                : "white",
                            fontWeight: "bold",
                            fontSize: "0.72rem",
                          }}
                        />
                        {selectedContent.media_type === "tv" && (
                          <Chip
                            label={`${selectedContent.episodes} Episode${selectedContent.episodes === 1 ? "" : "s"}`}
                            size="small"
                            sx={{
                              bgcolor: "rgba(0,0,0,0.06)",
                              fontSize: "0.72rem",
                            }}
                          />
                        )}
                      </Stack>

                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          mb: 1.5,
                        }}
                      >
                        {selectedContent.genres?.map((g) => {
                          const color = getGenreColor(g.id);
                          return (
                            <Chip
                              key={g.id}
                              label={g.name}
                              size="small"
                              sx={{
                                bgcolor: color,
                                fontSize: "0.68rem",
                                height: 18,
                              }}
                            />
                          );
                        })}
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          lineHeight: 1.45,
                        }}
                      >
                        {selectedContent.overview || "No overview available."}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<PlayArrowIcon />}
                        onClick={handleStartWatching}
                        sx={{
                          flexGrow: 1,
                          bgcolor: "success.main",
                          "&:hover": { bgcolor: "success.dark" },
                          fontWeight: "bold",
                          borderRadius: 2,
                          boxShadow: "0 4px 14px rgba(154, 205, 50, 0.35)",
                          textTransform: "none",
                          py: 1,
                        }}
                      >
                        Start Watching 🍿
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              )}
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

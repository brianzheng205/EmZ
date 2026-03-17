import { Add } from "@mui/icons-material";
import {
  Autocomplete,
  Avatar,
  Box,
  Typography,
  Paper,
  Divider,
  IconButton,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { debounce } from "lodash";
import { useMemo, useState } from "react";

import { addContentToFirebase } from "./firebaseUtils";
import {
  Content,
  EmZContent,
  fetchDataFromTMDB,
  Movie,
  TMDBSearchMultiResponse,
  TVShow,
  whoOptions,
  WhoSelection,
} from "./utils";

import {
  mapTvData,
  mapMovieData,
  findNewCollectionMovies,
  CollectionRef,
} from "@shared/tv/functions";

type SearchBarProps<T> = {
  rows: EmZContent[];
  setRows: React.Dispatch<React.SetStateAction<EmZContent[]>>;
  fetchSearchResults: (query: string) => Promise<T>;
};

export default function ContentSearchBar({
  rows,
  setRows,
  fetchSearchResults,
}: SearchBarProps<TMDBSearchMultiResponse>) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<Content[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [who, setWho] = useState<WhoSelection>("Both");
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

  const debouncedFetch = useMemo(() => {
    const fetchResults = async (query) => {
      setLoading(true);
      const data = await fetchSearchResults(query);
      const rowIds = new Set(rows.map((row) => row.id));

      setOptions(
        data.results.filter(
          (item) =>
            (item.media_type == "tv" || item.media_type == "movie") &&
            !rowIds.has(item.id),
        ),
      );
      setLoading(false);
    };

    return debounce((query: string) => {
      fetchResults(query);
    }, 300);
  }, [rows, fetchSearchResults]);

  const handleInputChange = (event, value: string) => {
    setInputValue(value);
    debouncedFetch(value);
  };

  const addContent = async (value: Content, who: WhoSelection) => {
    const isTv = value.media_type === "tv";
    const id = value.id;
    const url = isTv
      ? `https://api.themoviedb.org/3/tv/${id}?append_to_response=watch%2Fproviders&language=en-US`
      : `https://api.themoviedb.org/3/movie/${id}?append_to_response=watch%2Fproviders&language=en-US`;

    try {
      const tmdbData = await fetchDataFromTMDB(url);
      if (!tmdbData) return;

      const baseDoc = { ...value, who, watched: 0 };
      let finalDoc: EmZContent;
      let collectionRef: CollectionRef | null = null;

      if (isTv) {
        finalDoc = mapTvData(baseDoc as any, tmdbData) as unknown as EmZContent;
      } else {
        const result = mapMovieData(baseDoc as any, tmdbData);
        finalDoc = result.data as unknown as EmZContent;
        collectionRef = result.collection;
      }

      // Add the primary content
      await addContentToFirebase(finalDoc);
      setRows((prev) => [...prev, finalDoc]);

      // If it's a movie in a collection, discover and add other parts
      if (collectionRef) {
        const collectionData = await fetchDataFromTMDB(
          `https://api.themoviedb.org/3/collection/${collectionRef.id}?language=en-US`,
        );

        if (collectionData?.parts) {
          const rowIds = new Set(rows.map((r) => r.id));
          const newIds = findNewCollectionMovies(rowIds, collectionData.parts);

          // For the Search Bar, we'll just add the other movies in the collection.
          // Note: We don't batch here since search bar adds are usually small.
          for (const movieId of newIds) {
            const movieData = await fetchDataFromTMDB(
              `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=watch%2Fproviders&language=en-US`,
            );
            if (!movieData) continue;

            const partBase = { id: movieId, who, watched: 0, media_type: "movie" };
            const { data: partData } = mapMovieData(partBase as any, movieData);
            const partDoc = partData as unknown as EmZContent;

            await addContentToFirebase(partDoc);
            setRows((prev) => [...prev, partDoc]);
          }
        }
      }
    } catch (error) {
      console.error("Error adding content:", error);
    }
  };
  return (
    <Paper
      elevation={2}
      sx={{
        display: "flex",
        width: "100%",
        maxWidth: 800,
        borderRadius: 8,
        overflow: "hidden",
        bgcolor: "background.paper",
        alignItems: "center",
      }}
    >
      <Autocomplete
        freeSolo
        options={options}
        value={selectedContent}
        inputValue={inputValue}
        getOptionLabel={(option) => {
          return typeof option === "string"
            ? option
            : option.media_type === "tv"
              ? (option as TVShow).name
              : (option as Movie).title;
        }}
        onInputChange={handleInputChange}
        onChange={(event, value) => {
          setSelectedContent(value as Content | null);
        }}
        loading={loading}
        sx={{ flex: 1 }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              mt: 1,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              overflow: "hidden",
            },
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search TV Shows or Movies..."
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  border: "none",
                },
              },
            }}
            InputProps={{
              ...params.InputProps,
              sx: { px: 3, py: 0.5, fontSize: "1.1rem", height: "100%" },
            }}
          />
        )}
        renderOption={(props, option) => {
          const mediaKey = `${option.media_type}-${option.id}`;
          return (
            <Box
              component="li"
              {...props}
              key={mediaKey}
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                p: "8px !important",
              }}
            >
              <Avatar
                key={`${mediaKey}-avatar`}
                alt={
                  option.media_type === "tv"
                    ? (option as TVShow).name
                    : (option as Movie).title
                }
                src={`https://image.tmdb.org/t/p/w154/${option.poster_path}`}
                variant="rounded"
                sx={{ height: 120, width: 80 }}
              />
              <Box key={`${mediaKey}-info`}>
                <Typography variant="body1" fontWeight="medium">
                  {option.media_type === "tv"
                    ? (option as TVShow).name
                    : (option as Movie).title}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textTransform: "uppercase" }}
                >
                  {option.media_type}
                </Typography>
              </Box>
            </Box>
          );
        }}
      />

      <Divider orientation="vertical" flexItem />

      <Select
        value={who}
        variant="standard"
        disableUnderline
        onChange={(event) => {
          setWho(event.target.value as WhoSelection);
        }}
        sx={{
          minWidth: 100,
          pl: 2,
          pr: 1,
          fontFamily: "inherit",
          fontWeight: "bold",
          color:
            who === "Emily"
              ? "primary.main"
              : who === "Brian"
                ? "secondary.main"
                : "text.primary",
        }}
      >
        {whoOptions.map((option) => (
          <MenuItem
            key={option}
            value={option}
            sx={{
              color:
                option === "Emily"
                  ? "primary.main"
                  : option === "Brian"
                    ? "secondary.main"
                    : "text.primary",
              fontWeight: "bold",
            }}
          >
            {option}
          </MenuItem>
        ))}
      </Select>

      <IconButton
        color="primary"
        sx={{
          borderRadius: 0,
          px: 3,
          alignSelf: "stretch",
          bgcolor: "primary.main",
          color: "white",
          "&:hover": {
            bgcolor: "primary.dark",
          },
        }}
        onClick={() => {
          if (selectedContent) {
            addContent(selectedContent, who);
            setSelectedContent(null);
            setInputValue("");
            setOptions([]);
          }
        }}
      >
        <Add />
      </IconButton>
    </Paper>
  );
}

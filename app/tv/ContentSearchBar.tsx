import { Add } from "@mui/icons-material";
import {
  Autocomplete,
  Avatar,
  Box,
  MenuItem,
  Select,
  Typography,
  TextField,
  Paper,
  Divider,
  IconButton,
} from "@mui/material";
import { GridRowsProp } from "@mui/x-data-grid";
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

type SearchBarProps<T> = {
  rows: GridRowsProp;
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
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
    value["who"] = who;
    value["watched"] = 0;

    if (value.media_type === "tv") {
      const tvData = await fetchDataFromTMDB(
        `https://api.themoviedb.org/3/tv/${value.id}?append_to_response=watch%2Fproviders&language=en-US`,
      );

      value["episodes"] = tvData.number_of_episodes;
      value["ongoing"] = tvData.in_production;
      value["next_episode_to_air"] = tvData.next_episode_to_air;
      value["seasons"] = tvData.seasons;
      value["watch_providers"] = tvData["watch/providers"].results?.US || [];
    } else {
      const movieData = await fetchDataFromTMDB(
        `https://api.themoviedb.org/3/movie/${value.id}?append_to_response=watch%2Fproviders&language=en-US`,
      );

      if (movieData.belongs_to_collection) {
        const collection = await fetchDataFromTMDB(
          `https://api.themoviedb.org/3/collection/${movieData.belongs_to_collection.id}?append_to_response=watch%2Fproviders&language=en-US`,
        );

        for (const part of collection.parts) {
          if (part.id !== value.id) {
            part["who"] = who;
            part["watched"] = 0;
            part["episodes"] = 1;
            part["ongoing"] = false;
            part["watch_providers"] =
              collection["watch/providers"]?.results?.US || [];

            addContentToFirebase(part as EmZContent)
              .then(() => {
                setRows((prevRows: GridRowsProp[]) => {
                  return [...prevRows, { ...part }];
                });
              })
              .catch((error) => {
                console.error("Error adding content from collection:", error);
              });
          }
        }
      }

      value["episodes"] = 1;
      value["ongoing"] = false;
      value["watch_providers"] = movieData["watch/providers"].results?.US || [];
    }
    addContentToFirebase(value as EmZContent)
      .then(() => {
        setRows((prevRows: GridRowsProp[]) => {
          return [...prevRows, { ...value }];
        });
      })
      .catch((error) => {
        console.error("Error adding content:", error);
      });
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
        renderOption={(props, option) => (
          <Box
            component="li"
            {...props}
            key={`${option.media_type}-${option.id}`}
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              p: "8px !important",
            }}
          >
            <Avatar
              alt={
                option.media_type === "tv"
                  ? (option as TVShow).name
                  : (option as Movie).title
              }
              key={option.id}
              src={`https://image.tmdb.org/t/p/w154/${option.poster_path}`}
              variant="rounded"
              sx={{ height: 120, width: 80 }}
            />
            <Box>
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
        )}
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

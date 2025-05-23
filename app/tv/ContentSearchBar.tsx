import { Add } from "@mui/icons-material";
import {
  Stack,
  Autocomplete,
  Avatar,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import { GridRowsProp } from "@mui/x-data-grid";
import { debounce } from "lodash";
import { useState, useMemo } from "react";

import { addContentToFirebase } from "./firebaseUtils";
import {
  TVShow,
  Movie,
  Content,
  WhoSelection,
  TMDBSearchMultiResponse,
  whoOptions,
  fetchDataFromTMDB,
  EmZContent,
} from "./utils";

type SearchBarProps<T> = {
  fetchData: () => void;
  rows: GridRowsProp;
  fetchSearchResults: (query: string) => Promise<T>;
};

export default function ContentSearchBar({
  fetchData,
  rows,
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
          (item) => item.media_type !== "person" && !rowIds.has(item.id)
        )
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
        `https://api.themoviedb.org/3/tv/${value.id}?append_to_response=watch%2Fproviders&language=en-US`
      );

      value["episodes"] = tvData.number_of_episodes;
      value["ongoing"] = tvData.in_production;
      value["next_episode_to_air"] = tvData.next_episode_to_air;
      value["seasons"] = tvData.seasons;
      value["watch_providers"] = tvData["watch/providers"].results?.US || [];
    } else {
      const movieData = await fetchDataFromTMDB(
        `https://api.themoviedb.org/3/movie/${value.id}?append_to_response=watch%2Fproviders&language=en-US`
      );

      if (movieData.belongs_to_collection) {
        const collection = await fetchDataFromTMDB(
          `https://api.themoviedb.org/3/collection/${movieData.belongs_to_collection.id}?append_to_response=watch%2Fproviders&language=en-US`
        );

        for (const part of collection.parts) {
          if (part.id !== value.id) {
            part["who"] = who;
            part["watched"] = 0;
            part["episodes"] = 1;
            part["ongoing"] = false;
            part["watch_providers"] =
              collection["watch/providers"].results?.US || [];

            addContentToFirebase(part as EmZContent);
          }
        }
      }

      value["episodes"] = 1;
      value["ongoing"] = false;
      value["watch_providers"] = movieData["watch/providers"].results?.US || [];
    }
    addContentToFirebase(value as EmZContent);
    fetchData();
  };
  return (
    <Stack
      direction={"row"}
      sx={{
        gap: 2,
        width: "100%",
        justifyContent: "center",
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
        renderInput={(params) => (
          <TextField {...params} label="Search Content" />
        )}
        renderOption={(props, option) => (
          <Box
            component="li"
            {...props}
            key={`${option.media_type}-${option.id}`}
            sx={{ display: "flex", gap: 2 }}
          >
            <Avatar
              alt={
                option.media_type === "tv"
                  ? (option as TVShow).name
                  : (option as Movie).title
              }
              key={option.id}
              src={`https://image.tmdb.org/t/p/w500/${option.poster_path}`}
              variant="square"
              sx={{ height: 50, width: "auto" }}
            />
            {option.media_type === "tv"
              ? (option as TVShow).name
              : (option as Movie).title}
          </Box>
        )}
      />
      <Select
        value={who}
        onChange={(event) => {
          setWho(event.target.value as WhoSelection);
        }}
      >
        {whoOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
      <Button
        startIcon={<Add />}
        onClick={() => {
          if (selectedContent) {
            addContent(selectedContent, who);
            setSelectedContent(null);
            setInputValue("");
            setOptions([]);
          }
        }}
      >
        Add Content
      </Button>
    </Stack>
  );
}

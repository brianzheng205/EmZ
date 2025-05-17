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
  fetchSearchResults,
} from "./utils";

type SearchBarProps = {
  fetchData: () => void;
  rows: GridRowsProp;
};

export default function SearchBar({ fetchData, rows }: SearchBarProps) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<Content[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [who, setWho] = useState<WhoSelection>("Both");
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

  const debouncedFetch = useMemo(() => {
    const fetchResults = async (query) => {
      setLoading(true);
      const data: TMDBSearchMultiResponse = await fetchSearchResults(query);
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
  }, [rows]);

  const handleInputChange = (event, value: string) => {
    setInputValue(value);
    debouncedFetch(value);
  };

  const addContent = async (value: Content, who: WhoSelection) => {
    value["who"] = who;
    value["watched"] = 0;

    if (value.media_type === "tv") {
      const tvData = await fetchDataFromTMDB(
        `https://api.themoviedb.org/3/tv/${value.id}`
      );

      value["episodes"] = tvData.number_of_episodes;
      value["ongoing"] = tvData.in_production;
      value["next_episode_to_air"] = tvData.next_episode_to_air;
    } else {
      value["episodes"] = 1;
      value["ongoing"] = false;
    }
    addContentToFirebase(value as EmZContent);
    fetchData();
  };
  return (
    <Stack
      direction={"row"}
      sx={{
        gap: 2,
        marginTop: "3%",
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
        sx={{ width: "60%" }}
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
        sx={{ width: "10%" }}
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

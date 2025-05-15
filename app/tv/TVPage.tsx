"use client";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Autocomplete,
  Box,
  TextField,
  Stack,
  Avatar,
  Chip,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import { DataGrid, GridRowsProp } from "@mui/x-data-grid";
import { debounce } from "lodash";
import { useState, useMemo, useEffect } from "react";

import CircularProgressWithLabel from "@/components/CircularProgressWithLabel";

import {
  addContentToFirebase,
  deleteContentFromFirebase,
  fetchAllContentFromFirebase,
} from "./firebaseUtils";
import {
  TMDBSearchMultiResponse,
  Content,
  TVShow,
  Movie,
  fetchSearchResults,
  fetchGenres,
  WhoSelection,
  TMDBGenre,
  EmZContent,
  fetchDataFromTMDB,
} from "./utils";

export default function TVPage() {
  const [options, setOptions] = useState<Content[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [genres, setGenres] = useState<Record<number, TMDBGenre> | null>(null);
  const [who, setWho] = useState<WhoSelection>("Both");

  const addContent = async (value: Content, who: WhoSelection) => {
    value["who"] = who;
    value["watched"] = 0;

    if (value.media_type === "tv") {
      const data = await fetchDataFromTMDB(
        `https://api.themoviedb.org/3/tv/${value.id}`
      );

      value["episodes"] = data.number_of_episodes;
      value["ongoing"] = data.in_production;
    } else {
      value["episodes"] = 1;
      value["ongoing"] = false;
    }
    console.log("value", value);
    addContentToFirebase(value as EmZContent);
    fetchData();
  };
  const fetchData = async () => {
    const data = await fetchAllContentFromFirebase();

    const genreData = genres ? genres : await fetchGenres();

    const rowsData = data.docs.map((doc) => {
      const docData = doc.data();
      return {
        ...docData,
        name: docData.media_type === "tv" ? docData.name : docData.title,
        genre: docData.genre_ids.map((id: number) => {
          return genreData[id];
        }),
      };
    });
    if (!genres) setGenres(genreData);
    setRows(rowsData);
  };

  useEffect(() => {
    fetchData();
  });

  const fetchResults = async (query) => {
    setLoading(true);
    const data: TMDBSearchMultiResponse = await fetchSearchResults(query);
    setOptions(data.results.filter((item) => item.media_type !== "person"));
    setLoading(false);
  };

  const debouncedFetch = useMemo(() => {
    return debounce((query: string) => {
      fetchResults(query);
    }, 300);
  }, []);

  const handleInputChange = (event, value: string) => {
    setInputValue(value);
    debouncedFetch(value);
  };

  const handleDelete = (id: number) => {
    deleteContentFromFirebase(id);
    fetchData();
  };
  return (
    <Stack sx={{ alignItems: "center" }}>
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
          getOptionLabel={(option) => {
            return typeof option === "string"
              ? option
              : option.media_type === "tv"
              ? (option as TVShow).name
              : (option as Movie).title;
          }}
          onInputChange={handleInputChange}
          onChange={(event, value) => {
            if (value) {
              addContent(value as Content, who);
            }
          }}
          loading={loading}
          sx={{ width: "80%" }}
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
          <MenuItem value="Emily">Emily</MenuItem>
          <MenuItem value="Brian">Brian</MenuItem>
          <MenuItem value="Both">Both</MenuItem>
        </Select>
      </Stack>
      <Box sx={{ height: 400, marginTop: "3%" }}>
        <DataGrid
          getRowHeight={() => "auto"}
          rows={rows}
          columns={[
            {
              field: "name",
              headerName: "Name",
              cellClassName: "base-cell left-aligned-cell",
            },
            {
              field: "who",
              headerName: "Who",
              cellClassName: "base-cell left-aligned-cell",
            },
            {
              field: "media_type",
              headerName: "Type",
              cellClassName: "base-cell left-aligned-cell",
            },
            {
              field: "genre",
              headerName: "Genre",
              width: 200,
              renderCell: (params) => (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  {params.row.genre.map((g, index) => (
                    <Chip key={index} label={g} />
                  ))}
                </Box>
              ),
              cellClassName: "base-cell center-aligned-cell",
            },
            {
              field: "ongoing",
              headerName: "Ongoing",
              cellClassName: "base-cell center-aligned-cell",
              type: "boolean",
            },
            {
              field: "status",
              headerName: "Status",
              cellClassName: "base-cell center-aligned-cell",
              width: 130,
              renderCell: (params) => {
                return (
                  <Chip
                    label={
                      params.row.watched === 0
                        ? "Not Started"
                        : params.row.watched < params.row.episodes
                        ? "In Progress"
                        : "Completed"
                    }
                  />
                );
              },
            },
            {
              field: "watched",
              headerName: "Watched",
              cellClassName: "base-cell left-aligned-cell",
            },
            {
              field: "episodes",
              headerName: "Total",
              cellClassName: "base-cell left-aligned-cell",
            },
            {
              field: "progress",
              headerName: "Progress",
              cellClassName: "base-cell center-aligned-cell",
              renderCell: (params) => {
                return (
                  <CircularProgressWithLabel
                    value={(params.row.watched * 100) / params.row.episodes}
                  />
                );
              },
            },
            {
              field: "actions",
              headerName: "",
              width: 150,
              renderCell: (params) => (
                <IconButton
                  aria-label="delete"
                  onClick={() => handleDelete(params.row.id)}
                >
                  <DeleteIcon />
                </IconButton>
              ),
              cellClassName: "base-cell center-aligned-cell",
            },
          ]}
          sx={{
            "& .base-cell": {
              display: "flex",
              alignItems: "center",
            },
            "& .left-aligned-cell": {
              justifyContent: "left",
            },
            "& .center-aligned-cell": {
              justifyContent: "center",
              paddingY: 1,
            },
          }}
        />
      </Box>
    </Stack>
  );
}

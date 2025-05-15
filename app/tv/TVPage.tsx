"use client";
import {
  Autocomplete,
  Box,
  TextField,
  Stack,
  Avatar,
  Chip,
  Select,
  MenuItem,
  Button,
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

    const data = await fetchDataFromTMDB(
      `https://api.themoviedb.org/3/tv/${value.id}`
    );
    value["episodes"] = data.number_of_episodes;
    value["ongoing"] = data.in_production;
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
              cellClassName: "centered-cell",
            },
            { field: "who", headerName: "Who", cellClassName: "centered-cell" },
            {
              field: "media_type",
              headerName: "Type",
              cellClassName: "centered-cell",
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
              cellClassName: "centered-cell",
            },
            {
              field: "ongoing",
              headerName: "Ongoing",
              cellClassName: "centered-cell",
            },
            {
              field: "status",
              headerName: "Status",
              cellClassName: "centered-cell",
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
              cellClassName: "centered-cell",
            },
            {
              field: "episodes",
              headerName: "Total",
              cellClassName: "centered-cell",
            },
            {
              field: "progress",
              headerName: "Progress",
              cellClassName: "centered-cell",
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
              headerName: "Actions",
              width: 150,
              renderCell: (params) => (
                <Button
                  color="error"
                  variant="contained"
                  onClick={() => handleDelete(params.row.id)}
                >
                  Delete
                </Button>
              ),
            },
          ]}
          sx={{
            "& .centered-cell": {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginY: 1, // Adds vertical margin to the cell
            },
          }}
        />
      </Box>
    </Stack>
  );
}

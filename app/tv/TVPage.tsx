"use client";
import { ArrowDropDown } from "@mui/icons-material";
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
import {
  DataGrid,
  GridRowsProp,
  GridValidRowModel,
  GridCellModesModel,
  GridCellParams,
  GridCellModes,
} from "@mui/x-data-grid";
import { isEqual, debounce } from "lodash";
import { useState, useMemo, useEffect, MouseEvent } from "react";

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
  const [cellModesModel, setCellModesModel] = useState<GridCellModesModel>({});

  const whoOptions: WhoSelection[] = ["Emily", "Brian", "Both"];

  const handleCellClick = (params: GridCellParams, event: MouseEvent) => {
    console.log("params", params);
    console.log("event", event);
    if (!params.isEditable) {
      return;
    }

    if (
      /* eslint-disable @typescript-eslint/no-explicit-any */
      (event.target as any).nodeType === 1 &&
      !event.currentTarget.contains(event.target as Element)
    ) {
      return;
    }

    setCellModesModel((prevModel) => {
      return {
        ...Object.keys(prevModel).reduce(
          (acc, id) => ({
            ...acc,
            [id]: Object.keys(prevModel[id]).reduce(
              (acc2, field) => ({
                ...acc2,
                [field]: { mode: GridCellModes.View },
              }),
              {}
            ),
          }),
          {}
        ),
        [params.id]: {
          // Revert the mode of other cells in the same row
          ...Object.keys(prevModel[params.id] || {}).reduce(
            (acc, field) => ({ ...acc, [field]: { mode: GridCellModes.View } }),
            {}
          ),
          [params.field]: { mode: GridCellModes.Edit },
        },
      };
    });
  };

  const handleCellModesModelChange = (newModel: GridCellModesModel) => {
    setCellModesModel(newModel);
  };

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
    addContentToFirebase(value as EmZContent);
    fetchData();
  };
  const fetchData = async () => {
    const data = await fetchAllContentFromFirebase();

    const genreData = genres ? genres : await fetchGenres();

    const showMenuItems = {};
    const rowsData = data.docs.map((doc) => {
      const docData = doc.data();
      showMenuItems[docData.id] = false;
      return {
        ...docData,
        name: docData.media_type === "tv" ? docData.name : docData.title,
        genre: docData.genre_ids.map((id: number) => {
          return genreData[id];
        }),
      };
    });
    if (!genres) {
      setGenres(genreData);
    }
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
          {whoOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </Stack>
      <Box sx={{ height: 400, marginTop: "3%" }}>
        <DataGrid
          getRowHeight={() => "auto"}
          cellModesModel={cellModesModel}
          onCellModesModelChange={handleCellModesModelChange}
          onCellClick={handleCellClick}
          processRowUpdate={(
            newRow: GridValidRowModel,
            oldRow: GridValidRowModel
          ) => {
            if (!isEqual(newRow, oldRow)) {
              addContentToFirebase(newRow as EmZContent);
              fetchData();
            }
            return newRow;
          }}
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
              cellClassName: "base-cell center-aligned-cell editable-cell",
              valueOptions: whoOptions,
              type: "singleSelect",

              editable: true,
              renderCell: (params) => {
                return (
                  <Chip
                    label={params.row.who}
                    onDelete={(event) => handleCellClick(params, event)}
                    deleteIcon={<ArrowDropDown />}
                    onClick={(event) => handleCellClick(params, event)}
                    color={
                      params.row.who === "Emily"
                        ? "primary"
                        : params.row.who === "Brian"
                        ? "secondary"
                        : "default"
                    }
                  />
                );
              },
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
                    color={
                      params.row.watched === 0
                        ? "default"
                        : params.row.watched < params.row.episodes
                        ? "info"
                        : "success"
                    }
                  />
                );
              },
            },
            {
              field: "watched",
              headerName: "Watched",
              cellClassName: "base-cell left-aligned-cell editable-cell",
              editable: true,
              type: "number",
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
            "& .editable-cell": {
              backgroundColor: "background.paper",
            },
          }}
        />
      </Box>
    </Stack>
  );
}

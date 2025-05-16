"use client";
import { ArrowDropDown } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, TextField, Stack, Chip, IconButton } from "@mui/material";
import {
  DataGrid,
  GridRowsProp,
  GridValidRowModel,
  GridCellModesModel,
  GridCellParams,
  GridCellModes,
} from "@mui/x-data-grid";
import { isEqual } from "lodash";
import { useState, useEffect, MouseEvent } from "react";

import CircularProgressWithLabel from "@/components/CircularProgressWithLabel";

import {
  addContentToFirebase,
  deleteContentFromFirebase,
  fetchAllContentFromFirebase,
} from "./firebaseUtils";
import SearchBar from "./SearchBar";
import { TMDBGenre, EmZContent, whoOptions, fetchGenres } from "./utils";

export default function TVPage() {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [genres, setGenres] = useState<Record<number, TMDBGenre> | null>(null);
  const [cellModesModel, setCellModesModel] = useState<GridCellModesModel>({});

  const handleCellClick = (params: GridCellParams, event: MouseEvent) => {
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

  const handleDelete = (id: number) => {
    deleteContentFromFirebase(id);
    fetchData();
  };

  return (
    <Stack sx={{ alignItems: "center" }}>
      <SearchBar fetchData={fetchData} />
      <Box sx={{ height: 600, marginTop: "3%" }}>
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
              valueGetter: (value, row) => {
                return row.genre_ids.map((id: number) => {
                  return genres ? genres[id] : id;
                });
              },
              renderCell: (params) => (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  {params.value.map((g, index) => (
                    <Chip key={index} label={g} />
                  ))}
                </Box>
              ),
              cellClassName: "base-cell left-aligned-cell vertical-padding",
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
              valueGetter: (value, row) => {
                return row.watched === 0
                  ? "Not Started"
                  : row.watched < row.episodes
                  ? "In Progress"
                  : "Completed";
              },
              renderCell: (params) => {
                return (
                  <Chip
                    label={params.value}
                    color={
                      params.value === "Not Started"
                        ? "default"
                        : params.value === "In Progress"
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

              renderEditCell: (params) => (
                <TextField
                  type="number"
                  variant="standard"
                  slotProps={{
                    input: {
                      disableUnderline: true,
                    },
                  }}
                  defaultValue={params.value}
                  onChange={(e) => {
                    const value = Math.max(
                      0,
                      Math.min(Number(e.target.value), params.row.episodes)
                    );
                    params.api.setEditCellValue({
                      id: params.id,
                      field: params.field,
                      value,
                    });
                  }}
                  sx={{
                    "& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button":
                      {
                        WebkitAppearance: "auto",
                      },
                    "& input[type=number]": {
                      MozAppearance: "text-field",
                    },
                  }}
                />
              ),
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
              valueGetter: (value, row) => {
                return (row.watched * 100) / row.episodes;
              },
              renderCell: (params) => {
                return <CircularProgressWithLabel value={params.value} />;
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
            },
            "& .vertical-padding": {
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

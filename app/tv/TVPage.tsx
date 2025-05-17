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
import {
  EmZContent,
  whoOptions,
  fetchGenres,
  EmZGenre, //Filter
} from "./utils";

export default function TVPage() {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [genres, setGenres] = useState<Record<number, EmZGenre> | null>(null);
  const [cellModesModel, setCellModesModel] = useState<GridCellModesModel>({});
  //const [filters, setFilters] = useState<Filter<EmZContent>[]>([]);

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
      };
    });
    if (!genres) {
      setGenres(genreData as Record<number, EmZGenre>);
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
      <SearchBar fetchData={fetchData} rows={rows} />
      <Stack sx={{ height: "70vh", width: "80%", marginTop: "3%" }}>
        {/*<Stack direction={"row"}>
          <Button></Button>
        </Stack>*/}
        <DataGrid
          showToolbar
          initialState={{
            sorting: {
              sortModel: [{ field: "status", sort: "asc" }],
            },
          }}
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
              flex: 2,
              valueGetter: (value, row) => {
                if (row.media_type === "movie") {
                  return row.title;
                }
                return row.name;
              },
            },
            {
              field: "who",
              headerName: "Who",
              cellClassName: "base-cell center-aligned-cell editable-cell",
              valueOptions: whoOptions,
              type: "singleSelect",
              editable: true,
              flex: 1,
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
              flex: 2,
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
                    <Chip
                      key={index}
                      label={g.name}
                      sx={{ backgroundColor: g.color }}
                    />
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
              flex: 1,
            },
            {
              field: "status",
              headerName: "Status",
              cellClassName: "base-cell center-aligned-cell",
              flex: 2,
              sortComparator: (v1, v2) => {
                if (v1 === v2) {
                  return 0;
                }
                if (v1 === "Not Started") {
                  return 1;
                }
                if (v1 === "Completed" && v2 === "In Progress") {
                  return 1;
                }

                return -1;
              },

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
              flex: 1,

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
                  onBlur={(event) => {
                    const value = Number(event.target.value);
                    if (value > 0 && value <= params.row.episodes) {
                      params.api.setEditCellValue({
                        id: params.id,
                        field: params.field,
                        value,
                      });
                    }
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
              flex: 1,
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
              width: 50,
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
      </Stack>
    </Stack>
  );
}

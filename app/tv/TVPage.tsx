"use client";
import { ArrowDropDown } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  TextField,
  Stack,
  Chip,
  IconButton,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  GridRowsProp,
  GridValidRowModel,
  GridCellModesModel,
  GridCellParams,
  GridCellModes,
} from "@mui/x-data-grid";
import { isEqual } from "lodash";
import { useState, useEffect, MouseEvent, useCallback } from "react";

import CircularProgressWithLabel from "@/components/CircularProgressWithLabel";

import ContentSearchBar from "./ContentSearchBar";
import {
  addContentToFirebase,
  deleteContentFromFirebase,
  fetchAllContentFromFirebase,
  fetchAllProvidersFromFirebase,
} from "./firebaseUtils";
import NetworkPage from "./NetworkPage";
import TableToolbar, { CustomToolbarProps } from "./TableToolbar";
import {
  EmZContent,
  whoOptions,
  fetchGenres,
  EmZGenre,
  Filter,
  applyFiltersAndSorts,
  NextEpisodeToAir,
  fetchDataFromTMDB,
  fetchContentSearchResults,
} from "./utils";

export default function TVPage() {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [genres, setGenres] = useState<Record<number, EmZGenre> | null>(null);
  const [cellModesModel, setCellModesModel] = useState<GridCellModesModel>({});
  const [filters, setFilters] = useState<Record<string, Filter<EmZContent>>>(
    {}
  );
  const [providers, setProviders] = useState<GridRowsProp>([]);

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

  const fetchData = useCallback(async () => {
    const data = await fetchAllContentFromFirebase();
    if (!data) {
      return;
    }

    const genreData = genres ? genres : await fetchGenres();

    const showMenuItems = {};
    const rowsData = await Promise.all(
      data.docs.map(async (doc) => {
        const docData = doc.data();
        const getEpisodeName = async () => {
          if (!docData.seasons || docData.watched === 0) {
            return null;
          }

          let seasonNum = 0;
          let episodeIndex = 0;
          let currentCount = 0;

          for (const season of docData.seasons) {
            if (season.season_number > 0) {
              if (docData.watched <= currentCount + season.episode_count) {
                episodeIndex = Math.max(docData.watched - currentCount, 1);
                seasonNum = season.season_number;
                const url = `https://api.themoviedb.org/3/tv/${docData.id}/season/${seasonNum}/episode/${episodeIndex}`;
                const data = await fetchDataFromTMDB(url);
                return data.name;
              } else {
                currentCount += season.episode_count;
              }
            }
          }
          return null;
        };
        showMenuItems[docData.id] = false;
        const episodeName = await getEpisodeName();
        if (episodeName) {
          return {
            ...docData,
            watched_name: episodeName,
          };
        }

        return docData;
      })
    );
    if (!genres) {
      setGenres(genreData as Record<number, EmZGenre>);
    }
    setRows(rowsData);
  }, [genres]);

  const fetchProviders = useCallback(async () => {
    const data = await fetchAllProvidersFromFirebase();
    if (!data) {
      return;
    }

    const rowsData = data.docs.map((doc) => {
      const docData = doc.data();
      return docData;
    });

    setProviders(rowsData);
  }, []);

  useEffect(() => {
    fetchData();
    fetchProviders();
  }, [fetchData, fetchProviders]);

  const handleDelete = (id: number) => {
    deleteContentFromFirebase(id)
      .then(() => {
        setRows((prevRows) => prevRows.filter((row) => row.id !== id));
      })
      .catch((error) => {
        console.error("Error deleting content:", error);
      });
  };

  return (
    <Stack
      sx={{ alignItems: "center", marginTop: "3%", width: "100%", gap: 4 }}
    >
      <Stack sx={{ gap: 2, width: "95%", alignItems: "center" }}>
        <ContentSearchBar
          setRows={setRows}
          rows={rows}
          fetchSearchResults={fetchContentSearchResults}
        />
        <Box sx={{ height: "80vh", width: "100%", justifyItems: "center" }}>
          <DataGrid
            slots={{ toolbar: TableToolbar }}
            disableColumnResize
            slotProps={{
              toolbar: {
                rows,
                genres,
                filters,
                setFilters,
                setRows,
              } as CustomToolbarProps,
            }}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 20, page: 0 },
              },
            }}
            pageSizeOptions={[20, 50, 100]}
            showToolbar
            disableVirtualization
            getRowHeight={() => "auto"}
            cellModesModel={cellModesModel}
            onCellModesModelChange={handleCellModesModelChange}
            onCellClick={handleCellClick}
            processRowUpdate={async (
              newRow: GridValidRowModel,
              oldRow: GridValidRowModel
            ) => {
              if (isEqual(newRow, oldRow)) return oldRow;

              try {
                await addContentToFirebase(newRow as EmZContent);
                setRows((prevRows) =>
                  prevRows.map((row) => (row.id === newRow.id ? newRow : row))
                );
                return newRow;
              } catch {
                console.log("Failed to update, reverting changes");
                return oldRow;
              }
            }}
            getRowId={(row) => row.id}
            rows={applyFiltersAndSorts(rows, filters)}
            columns={[
              {
                field: "name",
                headerName: "Name",
                cellClassName: "base-cell left-aligned-cell",
                flex: 1,
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
                width: 100,
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
                width: 50,
              },
              {
                field: "genre",
                headerName: "Genre",
                flex: 1,
                valueGetter: (value, row) => {
                  return row.genre_ids?.map((id: number) => {
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
                    {params.value?.map((g, index) => (
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
                width: 80,
              },
              {
                field: "status",
                headerName: "Status",
                cellClassName: "base-cell center-aligned-cell",
                width: 120,
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
                field: "watched_name",
                headerName: "Watched Episode Name",
                cellClassName: "base-cell left-aligned-cell",
                flex: 1,
              },
              {
                field: "watched",
                headerName: "Watched",
                cellClassName: "base-cell left-aligned-cell editable-cell",
                editable: true,
                type: "number",
                width: 80,

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
                      if (value >= 0 && value <= params.row.episodes) {
                        params.api.setEditCellValue({
                          id: params.id,
                          field: params.field,
                          value,
                        });
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        const value = Number(
                          (event.target as HTMLInputElement).value
                        );
                        if (value >= 0 && value <= params.row.episodes) {
                          params.api.setEditCellValue({
                            id: params.id,
                            field: params.field,
                            value,
                          });
                        }
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
                width: 60,
              },
              {
                field: "progress",
                headerName: "Progress",
                cellClassName: "base-cell center-aligned-cell",
                width: 80,
                valueGetter: (value, row) => {
                  return (row.watched * 100) / row.episodes;
                },
                renderCell: (params) => {
                  return <CircularProgressWithLabel value={params.value} />;
                },
              },
              {
                field: "next_episode_to_air",
                headerName: "Next Episode",
                cellClassName: "base-cell left-aligned-cell",
                width: 120,
                valueGetter: (value, row) => {
                  if (row.media_type === "tv") {
                    if (value) {
                      return new Date(
                        (value as NextEpisodeToAir).air_date + "T00:00:00"
                      );
                    }
                  } else if (row.media_type === "movie") {
                    const release_date = new Date(
                      row.release_date + "T00:00:00"
                    );
                    if (release_date > new Date()) {
                      return release_date;
                    }
                  }
                  return null;
                },
                renderCell: (params) => {
                  if (params.value) {
                    return new Date(params.value).toLocaleDateString();
                  }
                  return null;
                },
              },
              {
                field: "watch_providers",
                headerName: "Providers",
                cellClassName: "base-cell center-aligned-cell vertical-padding",
                flex: 1,
                renderCell: (params) => {
                  return (
                    <Stack
                      direction={"row"}
                      sx={{
                        flexWrap: "wrap",
                        gap: 1,
                        justifyContent: "center",
                      }}
                    >
                      {Object.keys(params.value || {})
                        .filter((key) => key !== "link")
                        .map((buyType) =>
                          params.value[buyType]
                            .filter(
                              (provider) =>
                                buyType === "free" ||
                                buyType === "ads" ||
                                providers.some(
                                  (p) => p.provider_id === provider.provider_id
                                )
                            )
                            .map((provider, index) => (
                              <Avatar
                                variant="rounded"
                                key={index}
                                src={`https://image.tmdb.org/t/p/w500/${provider.logo_path}`}
                              />
                            ))
                        )}
                    </Stack>
                  );
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
              width: "95%",
            }}
          />
        </Box>
      </Stack>
      <Accordion sx={{ width: "95%" }}>
        <AccordionSummary expandIcon={<ArrowDropDown />}>
          <Typography>Providers</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <NetworkPage providers={providers} setProviders={setProviders} />
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}

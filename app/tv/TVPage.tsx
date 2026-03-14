"use client";
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Stack,
  Typography,
  Grid,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Chip,
  TextField,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { 
  DataGrid, 
  GridValidRowModel, 
  GridCellModesModel, 
  GridCellParams,
  GridCellModes,
  GridRowsProp
} from "@mui/x-data-grid";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import DeleteIcon from "@mui/icons-material/Delete";
import { isEqual } from "lodash";
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
import TVCard from "./TVCard";
import {
  EmZContent,
  fetchGenres,
  EmZGenre,
  Filter,
  Provider,
  applyFiltersAndSorts,
  fetchDataFromTMDB,
  fetchContentSearchResults,
  whoOptions,
  NextEpisodeToAir,
  Movie,
  TVShow
} from "./utils";

export default function TVPage() {
  const [rows, setRows] = useState<EmZContent[]>([]);
  const [genres, setGenres] = useState<Record<number, EmZGenre> | null>(null);
  const [filters, setFilters] = useState<Record<string, Filter<EmZContent>>>(
    {}
  );
  const [providers, setProviders] = useState<Provider[]>([]);
  const [rowsLoading, setRowsLoading] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [cellModesModel, setCellModesModel] = useState<GridCellModesModel>({});

  const handleCellModesModelChange = useCallback((newModel: GridCellModesModel) => {
    setCellModesModel(newModel);
  }, []);

  const handleCellClick = useCallback((params: GridCellParams, event: React.MouseEvent) => {
    event.stopPropagation();
    setCellModesModel((prevModel) => ({
      ...prevModel,
      [params.id]: {
        ...prevModel[params.id],
        [params.field]: { mode: GridCellModes.Edit },
      },
    }));
  }, []);

  const handleUpdateInfo = async (updatedItem: EmZContent) => {
    try {
      const oldItem = rows.find(r => r.id === updatedItem.id);
      if (!oldItem) return;

      const isWatchedChanged = oldItem.watched !== updatedItem.watched;

      const itemToSave = { ...updatedItem };
      if (isWatchedChanged && itemToSave.media_type === "tv") {
        const episodeName = await getEpisodeName(itemToSave);
        itemToSave.watched_name = episodeName;
      }

      await addContentToFirebase(itemToSave);

      setRows((prevRows) =>
        prevRows.map((row) => (row.id === itemToSave.id ? itemToSave : row))
      );
    } catch {
      console.log("Failed to update, reverting changes");
    }
  };

  const getEpisodeName = async (docData: EmZContent) => {
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
          return data?.name || null;
        } else {
          currentCount += season.episode_count;
        }
      }
    }
    return null;
  };

  const fetchData = useCallback(async () => {
    try {
      setRowsLoading(true);
      const data = await fetchAllContentFromFirebase();
      if (!data) return;

      const genreData = genres ? genres : await fetchGenres();

      const rowsData = await Promise.all(
        data.docs.map(async (doc) => {
          const docData = doc.data() as EmZContent;
          const episodeName = await getEpisodeName(docData);
          return {
            ...docData,
            watched_name: episodeName,
          };
        })
      );

      if (!genres) {
        setGenres(genreData as Record<number, EmZGenre>);
      }
      setRows(rowsData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setRowsLoading(false);
    }
  }, [genres]);

  const fetchProviders = useCallback(async () => {
    const data = await fetchAllProvidersFromFirebase();
    if (!data) {
      return;
    }

    const rowsData = data.docs.map((doc) => {
      const docData = doc.data() as Provider;
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
                setRowsLoading,
                onOpenSettings: () => setIsSettingsOpen(true),
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
                      return new Date((value as NextEpisodeToAir).air_date);
                    }
                  } else if (row.media_type === "movie") {
                    const release_date = new Date(row.release_date);
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
                      {params.value && Object.keys(params.value)
                        .filter((key) => key !== "link")
                        .map((buyType) =>
                          params.value[buyType]
                            ? params.value[buyType]
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
                            : null
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

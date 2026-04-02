"use client";
import CloseIcon from "@mui/icons-material/Close";
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
  AccordionDetails,
} from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";

import ContentSearchBar from "./ContentSearchBar";
import {
  addContentToFirebase,
  deleteContentFromFirebase,
  subscribeToAllContentFromFirebase,
  subscribeToAllProvidersFromFirebase,
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
} from "./utils";

export default function TVPage() {
  const [rows, setRows] = useState<EmZContent[]>([]);
  const [genres, setGenres] = useState<Record<number, EmZGenre> | null>(null);
  const [filters, setFilters] = useState<Record<string, Filter<EmZContent>>>(
    {},
  );
  const [providers, setProviders] = useState<Provider[]>([]);
  const [rowsLoading, setRowsLoading] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleUpdateInfo = async (updatedItem: EmZContent) => {
    try {
      const oldItem = rows.find((r) => r.id === updatedItem.id);
      if (!oldItem) return;

      const itemToSave = { ...updatedItem };

      await addContentToFirebase(itemToSave);
    } catch {
      console.log("Failed to update, reverting changes");
    }
  };


  useEffect(() => {
    if (!genres) {
      fetchGenres().then((genreData) => {
        setGenres(genreData as Record<number, EmZGenre>);
      });
    }
  }, [genres]);

  useEffect(() => {
    setRowsLoading(true);

    const unsubscribeContent = subscribeToAllContentFromFirebase((snapshot) => {
      const rowsData = snapshot.docs.map((doc) => {
        const docData = doc.data() as EmZContent;
        return {
          ...docData,
          override_as_complete: docData.override_as_complete || false,
        };
      });
      setRows(rowsData);
      setRowsLoading(false);
    });

    const unsubscribeProviders = subscribeToAllProvidersFromFirebase((snapshot) => {
      const providersData = snapshot.docs.map((doc) => doc.data() as Provider);
      setProviders(providersData);
    });

    return () => {
      unsubscribeContent();
      unsubscribeProviders();
    };
  }, []);

  const handleDelete = (id: number) => {
    deleteContentFromFirebase(id)
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

        <Box sx={{ width: "100%" }}>
          <TableToolbar
            rows={rows}
            genres={genres}
            filters={filters}
            setFilters={setFilters}
            setRows={setRows}
            setRowsLoading={setRowsLoading}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </Box>

        {rowsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ width: "100%" }}>
            {applyFiltersAndSorts(rows, filters).map((item) => (
              <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <TVCard
                  item={item}
                  genres={genres}
                  providers={providers}
                  onUpdate={handleUpdateInfo}
                  onDelete={handleDelete}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>

      <Dialog
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, bgcolor: "background.default" },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Manage Watch Providers
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => setIsSettingsOpen(false)}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <NetworkPage providers={providers} setProviders={setProviders} />
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

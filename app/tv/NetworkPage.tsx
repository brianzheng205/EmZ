import DeleteIcon from "@mui/icons-material/Delete";
import {
  Stack,
  Avatar,
  IconButton,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";

import { deleteProviderFromFirebase } from "./firebaseUtils";
import ProviderSearchBar from "./ProviderSearchBar";
import { fetchWatchProvidersSearchResults } from "./utils";
import { Provider } from "./utils";

export type NetworkPageProps = {
  providers: Provider[];
  setProviders: Dispatch<SetStateAction<Provider[]>>;
};
export default function NetworkPage({
  providers,
  setProviders,
}: NetworkPageProps) {
  const handleDelete = (id: number) => {
    deleteProviderFromFirebase(id)
      .then(() => {
        setProviders((prevProviders) =>
          prevProviders.filter((provider) => provider.provider_id !== id),
        );
      })
      .catch((error) => {
        console.error("Error deleting provider:", error);
      });
  };
  return (
    <Stack sx={{ gap: 2 }}>
      <ProviderSearchBar
        setRows={setProviders}
        rows={providers}
        fetchSearchResults={fetchWatchProvidersSearchResults}
      />
      <Box sx={{ flexGrow: 1, mt: 1 }}>
        <Grid container spacing={2}>
          {Array.from(providers)
            .sort((a, b) => a.provider_name.localeCompare(b.provider_name))
            .map((provider) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                key={provider.provider_id}
              >
                <Card
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 1.5,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <Avatar
                    variant="rounded"
                    src={`https://image.tmdb.org/t/p/w500${provider.logo_path}`}
                    sx={{ width: 48, height: 48, mr: 2 }}
                  />
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      p: "0 !important",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      sx={{ color: "primary.main" }}
                    >
                      {provider.provider_name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(provider.provider_id)}
                      sx={{
                        color: "error.main",
                        "&:hover": { bgcolor: "error.light", color: "white" },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </Box>
    </Stack>
  );
}

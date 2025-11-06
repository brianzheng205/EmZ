import DeleteIcon from "@mui/icons-material/Delete";
import { Stack, Avatar, IconButton } from "@mui/material";
import {
  DataGrid,
  GridRowsProp,
  GridRenderCellParams,
  GridValidRowModel,
} from "@mui/x-data-grid";
import { Dispatch, SetStateAction } from "react";

import { deleteProviderFromFirebase } from "./firebaseUtils";
import ProviderSearchBar from "./ProviderSearchBar";
import { fetchWatchProvidersSearchResults } from "./utils";

export type NetworkPageProps = {
  providers: GridRowsProp;
  setProviders: Dispatch<SetStateAction<readonly GridValidRowModel[]>>;
};
export default function NetworkPage({
  providers,
  setProviders,
}: NetworkPageProps) {
  const columns = [
    {
      field: "logo_path",
      headerName: "Logo",
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Avatar
            variant="rounded"
            src={`https://image.tmdb.org/t/p/w500${params.row.logo_path}`}
            style={{ height: 50, width: 50 }}
          />
        );
      },
      width: 60,
    },
    {
      field: "provider_name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "",
      width: 50,
      renderCell: (params) => (
        <IconButton
          aria-label="delete"
          onClick={() => handleDelete(params.row.provider_id)}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  const handleDelete = (id: number) => {
    deleteProviderFromFirebase(id)
      .then(() => {
        setProviders((prevProviders) =>
          prevProviders.filter((provider) => provider.provider_id !== id)
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
      <DataGrid
        rows={Array.from(providers).sort((a, b) =>
          a.provider_name.localeCompare(b.provider_name)
        )}
        columns={columns}
        getRowId={(row) => {
          return row.provider_id;
        }}
      />
    </Stack>
  );
}

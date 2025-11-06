import { Add } from "@mui/icons-material";
import {
  Stack,
  Autocomplete,
  Avatar,
  Box,
  Button,
  TextField,
} from "@mui/material";
import { GridRowsProp, GridValidRowModel } from "@mui/x-data-grid";
import { debounce } from "lodash";
import { useState, useMemo, Dispatch, SetStateAction } from "react";

import { addProviderToFirebase } from "./firebaseUtils";
import { Provider } from "./utils";

type SearchBarProps<T> = {
  setRows: Dispatch<SetStateAction<readonly GridValidRowModel[]>>;
  rows: GridRowsProp;
  fetchSearchResults: (query: string) => Promise<T>;
};

export default function ProviderSearchBar({
  setRows,
  rows,
  fetchSearchResults,
}: SearchBarProps<Provider[]>) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<Provider[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const debouncedFetch = useMemo(() => {
    const fetchResults = async (query) => {
      setLoading(true);
      const data = await fetchSearchResults(query);
      const rowIds = new Set(rows.map((row) => row.provider_id));

      setOptions(data.filter((item) => !rowIds.has(item.provider_id)));
      setLoading(false);
    };

    return debounce((query: string) => {
      fetchResults(query);
    }, 300);
  }, [rows, fetchSearchResults]);

  const handleInputChange = (event, value: string) => {
    setInputValue(value);
    debouncedFetch(value);
  };

  const addProvider = async (value: Provider) => {
    addProviderToFirebase(value)
      .then(() => {
        setRows((prevRows) => [...prevRows, value]);
      })
      .catch((error) => {
        console.error("Error adding provider:", error);
      });
  };
  return (
    <Stack
      direction={"row"}
      sx={{
        gap: 2,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Autocomplete
        freeSolo
        options={options}
        value={selectedProvider}
        inputValue={inputValue}
        getOptionLabel={(option) => {
          return (option as Provider).provider_name;
        }}
        onInputChange={handleInputChange}
        onChange={(event, value) => {
          setSelectedProvider(value as Provider | null);
        }}
        loading={loading}
        sx={{ flex: 1 }}
        renderInput={(params) => (
          <TextField {...params} label="Search Providers" />
        )}
        renderOption={(props, option) => (
          <Box
            component="li"
            {...props}
            key={`${option.provider_id}`}
            sx={{ display: "flex", gap: 2 }}
          >
            <Avatar
              key={option.provider_id}
              src={`https://image.tmdb.org/t/p/w500/${option.logo_path}`}
              variant="rounded"
              sx={{ height: 50, width: "auto" }}
            />
            {option.provider_name}
          </Box>
        )}
      />
      <Button
        startIcon={<Add />}
        onClick={() => {
          if (selectedProvider) {
            addProvider(selectedProvider);
            setSelectedProvider(null);
            setInputValue("");
            setOptions([]);
          }
        }}
      >
        Add Provider
      </Button>
    </Stack>
  );
}

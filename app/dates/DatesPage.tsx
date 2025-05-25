"use client";

import { Container, Stack, Tabs, Tab } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import * as R from "ramda";
import { useState, useEffect } from "react";

import CenteredLoader from "@/components/CenteredLoader";
import useDialog from "@/hooks/useDialog";

import DateItemDialog from "./dialogs/DateItemDialog";
import {
  fetchDateList,
  createDateListItem,
  updateDateListItem,
  deleteDateListItem,
} from "./firebaseUtils";
import { DatePlanner, DateMap, DateList } from "./tabs";
import { FirestoreListItem, ListRow } from "./types";
import { getCommonColumns, isValidListItem } from "./utils";

enum TabValue {
  LIST = "list",
  MAP = "map",
  PLANNER = "planner",
}

export default function DatesPage() {
  const [activeTab, setActiveTab] = useState(TabValue.LIST);

  const [rows, setRows] = useState<ListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.Place | null>(null);
  const [addedPlace, setAddedPlace] = useState<google.maps.places.Place | null>(
    null
  );

  const {
    isDialogOpen: isAddListItemDialogOpen,
    openDialog: openAddListItemDialog,
    closeDialog: closeAddListItemDialog,
  } = useDialog();

  const fetchData = async () => {
    setLoading(true);
    const fetchedRows = await fetchDateList();
    setRows(fetchedRows);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddRow = async (newListItem: FirestoreListItem) => {
    const newId = await createDateListItem(newListItem);

    if (R.isNil(newId)) return;

    const newRow: ListRow = {
      ...newListItem,
      id: newId,
    };
    setRows((prevRows) => [...prevRows, newRow]);
  };

  const processRowUpdate = async (newRow: ListRow, oldRow: ListRow) => {
    if (R.equals(newRow, oldRow)) return newRow;

    const row = rows.find((row) => row.id === newRow.id);
    if (R.isNil(row)) {
      console.error("Row not found");
      return oldRow;
    }

    const isValid = isValidListItem(rows, row);
    if (!isValid) return oldRow;

    try {
      await updateDateListItem(newRow);
      setRows((prevRows) =>
        prevRows.map((row) => (row.id === newRow.id ? newRow : row))
      );
      return newRow;
    } catch (error) {
      console.error("Error updating row:", error);
      return oldRow;
    }
  };

  const onProcessRowUpdateError = (error) => {
    console.error("Error processing row update:", error);
  };

  const handleDeleteRow = async (row: ListRow) => {
    try {
      await deleteDateListItem(row.id);
      setRows((prevRows) => prevRows.filter((r) => r.id !== row.id));
    } catch (error) {
      console.error("Error deleting row:", error);
    }
  };

  const commonColumns = getCommonColumns(handleDeleteRow);
  const columns: GridColDef[] = [
    commonColumns.name,
    commonColumns.duration,
    commonColumns.cost,
    commonColumns.activityType,
    commonColumns.notes,
    commonColumns.delete,
  ];

  const handleAddPlace = (place: google.maps.places.Place | null) => {
    if (!place) return;

    setAddedPlace(place);
    openAddListItemDialog();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  };

  if (loading) return <CenteredLoader />;

  return (
    <Container sx={{ height: "100%", padding: 2 }}>
      <Stack sx={{ height: "100%", gap: 2 }}>
        <Stack sx={{ flexDirection: "row", justifyContent: "center" }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            {Object.values(TabValue).map((value, i) => (
              <Tab key={i} label={value} value={value} />
            ))}
          </Tabs>
        </Stack>
        {activeTab === TabValue.LIST ? (
          <DateList
            rows={rows}
            columns={columns}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={onProcessRowUpdateError}
            openAddListItemDialog={openAddListItemDialog}
            fetchData={fetchData}
          />
        ) : activeTab === TabValue.MAP ? (
          <DateMap
            selectedPlace={selectedPlace}
            setSelectedPlace={setSelectedPlace}
            dateListItems={rows}
            onAddPlace={handleAddPlace}
          />
        ) : (
          activeTab === TabValue.PLANNER && <DatePlanner />
        )}
      </Stack>

      <DateItemDialog
        open={isAddListItemDialogOpen}
        onClose={closeAddListItemDialog}
        onSubmit={handleAddRow}
        title="Add Date Item"
        submitText="Add"
        dateListItems={rows}
        addedPlace={addedPlace}
        setAddedPlace={setAddedPlace}
        onSelectMap={() => {
          setActiveTab(TabValue.MAP);
          closeAddListItemDialog();
        }}
      />
    </Container>
  );
}

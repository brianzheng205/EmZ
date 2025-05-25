"use client";

import { Container, Stack, Tabs, Tab } from "@mui/material";
import { DocumentReference } from "firebase/firestore";
import * as R from "ramda";
import { useState, useEffect } from "react";

import CenteredLoader from "@/components/CenteredLoader";
import useDialog from "@/hooks/useDialog";

import DateItemDialog from "./dialogs/DateItemDialog";
import {
  fetchDateList,
  createDateListItem,
  fetchAllDates,
  fetchActiveDateRef,
} from "./firebaseUtils";
import { DatePlanner, DateMap, DateList } from "./tabs";
import {
  FirestoreListItem,
  ListRow,
  PlannerRow,
  IdToPlannerDate,
} from "./types";

enum TabValue {
  LIST = "list",
  MAP = "map",
  PLANNER = "planner",
}

export default function DatesPage() {
  const [activeTab, setActiveTab] = useState(TabValue.LIST);
  const [loading, setLoading] = useState(true);

  const [listRows, setListRows] = useState<ListRow[]>([]);
  const [plannerDates, setPlannerDates] = useState<IdToPlannerDate>({});
  const [activeDateRef, setActiveDateRef] = useState<DocumentReference | null>(
    null
  );
  const [plannerRows, setPlannerRows] = useState<PlannerRow[]>([]);

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

  const fetchDateListData = async () => {
    const fetchedRows = await fetchDateList();
    setListRows(fetchedRows);
  };

  const fetchPlannerDates = async () => {
    const fetchedDates = await fetchAllDates();
    setPlannerDates(fetchedDates);

    const fetchedActiveDateRef = await fetchActiveDateRef();
    setActiveDateRef(fetchedActiveDateRef);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchDateListData();
      await fetchPlannerDates();
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleAddRow = async (newListItem: FirestoreListItem) => {
    const newId = await createDateListItem(newListItem);

    if (R.isNil(newId)) return;

    const newRow: ListRow = {
      ...newListItem,
      id: newId,
    };
    setListRows((prevRows) => [...prevRows, newRow]);
  };

  const handleAddPlace = (place: google.maps.places.Place | null) => {
    if (!place) return;

    setAddedPlace(place);
    openAddListItemDialog();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  };

  const renderTabContent = () =>
    activeTab === TabValue.LIST ? (
      <DateList
        rows={listRows}
        setRows={setListRows}
        onAdd={openAddListItemDialog}
        onRefresh={async () => {
          setLoading(true);
          await fetchDateListData();
          setLoading(false);
        }}
      />
    ) : activeTab === TabValue.MAP ? (
      <DateMap
        selectedPlace={selectedPlace}
        setSelectedPlace={setSelectedPlace}
        dateListItems={listRows}
        onAddPlace={handleAddPlace}
      />
    ) : (
      activeTab === TabValue.PLANNER && (
        <DatePlanner
          dates={plannerDates}
          setDates={setPlannerDates}
          activeDateRef={activeDateRef}
          setActiveDateRef={setActiveDateRef}
          rows={plannerRows}
          setRows={setPlannerRows}
          onRefresh={async () => {
            setLoading(true);
            await fetchPlannerDates();
            setLoading(false);
          }}
        />
      )
    );

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

        {loading ? <CenteredLoader /> : renderTabContent()}
      </Stack>

      <DateItemDialog
        open={isAddListItemDialogOpen}
        onClose={closeAddListItemDialog}
        onSubmit={handleAddRow}
        title="Add Date Item"
        submitText="Add"
        dateListItems={listRows}
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

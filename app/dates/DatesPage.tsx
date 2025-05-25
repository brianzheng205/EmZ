"use client";

import { Container, Stack, Tabs, Tab } from "@mui/material";
import { DocumentReference } from "firebase/firestore";
import * as R from "ramda";
import { useState, useEffect } from "react";

import CenteredLoader from "@/components/CenteredLoader";
import { getPlaceFromId } from "@/components/maps/utils";
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
  ListRowWithPlaces,
  PlannerRowWithPlace,
  FirestoreListItemWithPlace,
  FirestoreListItem,
  IdToPlannerDateWithPlaces,
  PlannerItemWithPlace,
  PlannerDateWithPlaces,
} from "./types";

enum TabValue {
  LIST = "list",
  MAP = "map",
  PLANNER = "planner",
}

export default function DatesPage() {
  const [activeTab, setActiveTab] = useState(TabValue.LIST);
  const [loading, setLoading] = useState(true);

  const [listRows, setListRows] = useState<ListRowWithPlaces[]>([]);
  const [plannerDates, setPlannerDates] = useState<IdToPlannerDateWithPlaces>(
    {}
  );
  const [activeDateRef, setActiveDateRef] = useState<DocumentReference | null>(
    null
  );
  const [plannerRows, setPlannerRows] = useState<PlannerRowWithPlace[]>([]);

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

    const rowsWithPlaces: ListRowWithPlaces[] = await Promise.all(
      fetchedRows.map(async (row) => {
        if (R.isNil(row.placeId) || row.placeId === "") {
          return {
            ...R.dissoc("placeId", row),
            place: null,
          } as ListRowWithPlaces;
        }

        try {
          const place = await getPlaceFromId(row.placeId);
          return {
            ...R.dissoc("placeId", row),
            place,
          } as ListRowWithPlaces;
        } catch (error) {
          console.error(
            `Failed to load place with ID ${row.placeId}: ${error}`
          );
          return {
            ...R.dissoc("placeId", row),
            place: null,
          } as ListRowWithPlaces;
        }
      })
    );
    setListRows(rowsWithPlaces);
  };

  const fetchPlannerDates = async () => {
    const fetchedDates = await fetchAllDates();

    const plannerDatesWithPlaces: IdToPlannerDateWithPlaces = await Promise.all(
      R.toPairs(fetchedDates).map(async ([dateId, date]) => [
        dateId,
        {
          ...date,
          schedule: await Promise.all(
            date.schedule.map(async (item) => {
              if (R.isNil(item.placeId) || item.placeId === "") {
                return {
                  ...R.dissoc("placeId", item),
                  place: null,
                } as PlannerItemWithPlace;
              }

              try {
                const place = await getPlaceFromId(item.placeId);
                return {
                  ...R.dissoc("placeId", item),
                  place,
                } as PlannerItemWithPlace;
              } catch (error) {
                console.error(
                  `Failed to load place with ID ${item.placeId}: ${error}`
                );
                return {
                  ...R.dissoc("placeId", item),
                  place: null,
                } as PlannerItemWithPlace;
              }
            })
          ),
        },
      ])
    ).then((res: [string, PlannerDateWithPlaces][]) => R.fromPairs(res));

    setPlannerDates(plannerDatesWithPlaces);

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

  const handleAddRow = async (newListItem: FirestoreListItemWithPlace) => {
    const firestoreListItem: FirestoreListItem = {
      ...R.dissoc("place", newListItem),
      placeId: newListItem.place?.id || "",
    };

    const newId = await createDateListItem(firestoreListItem);

    if (R.isNil(newId)) return;

    const newRow: ListRowWithPlaces = {
      ...newListItem,
      id: newId,
    };
    setListRows((prevRows) => [...prevRows, newRow]);
    setAddedPlace(null);
    setSelectedPlace(null);
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
          dateList={listRows}
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

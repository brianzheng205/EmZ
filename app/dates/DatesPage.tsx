"use client";

import { Container, Stack, Tabs, Tab } from "@mui/material";
import { useState } from "react";

import { DatePlanner, DateList } from "./tabs";

enum TabValue {
  PLANNER = "planner",
  LIST = "list",
}

export default function DatesPage() {
  const [activeTab, setActiveTab] = useState(TabValue.LIST);

  const handleTabChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container sx={{ height: "100%", padding: 2 }}>
      <Stack sx={{ height: "100%", gap: 2 }}>
        <Stack sx={{ flexDirection: "row", justifyContent: "center" }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label={TabValue.LIST} value={TabValue.LIST} />
            <Tab label={TabValue.PLANNER} value={TabValue.PLANNER} />
          </Tabs>
        </Stack>
        {activeTab === TabValue.LIST ? (
          <DateList />
        ) : (
          activeTab === TabValue.PLANNER && <DatePlanner />
        )}
      </Stack>
    </Container>
  );
}

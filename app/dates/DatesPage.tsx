"use client";

import { Container, Stack, Tabs, Tab } from "@mui/material";
import { useState } from "react";

import { DatePlanner, DateList } from "./tabs";

export default function DatesPage() {
  const [activeTab, setActiveTab] = useState("planner");

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  return (
    <Container>
      <Stack sx={{ gap: 2 }}>
        <Stack sx={{ flexDirection: "row", justifyContent: "center" }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Planner" value="planner" />
            <Tab label="List" value="list" />
          </Tabs>
        </Stack>
        <>
          {activeTab === "planner" && <DatePlanner />}
          {activeTab === "list" && <DateList />}
        </>
      </Stack>
    </Container>
  );
}

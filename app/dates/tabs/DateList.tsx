"use client";

import { Box } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useState, useEffect } from "react";

import CenteredLoader from "@/components/CenteredLoader";

import { getCommonColumns } from "../utils";

export default function DatePlanner() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  // TODO add delete row functionality
  const commonColumns = getCommonColumns(() => {});
  const columns: GridColDef[] = [
    commonColumns.name,
    commonColumns.location,
    commonColumns.duration,
    commonColumns.cost,
    commonColumns.activityType,
    commonColumns.notes,
  ];

  const rows = [
    {
      id: 1,
      name: "Activity 1",
      location: "Location 1",
      duration: 2,
      cost: 100,
      activityType: "Fun",
      notes: "Notes for activity 1",
    },
    {
      id: 2,
      name: "Activity 2",
      location: "Location 2",
      duration: 3,
      cost: 200,
      activityType: "Bulk",
      notes: "Notes for activity 2",
    },
    // Add more rows as needed
  ];

  if (loading) return <CenteredLoader />;

  return (
    <Box>
      <DataGrid rows={rows} columns={columns} showToolbar hideFooter />
    </Box>
  );
}

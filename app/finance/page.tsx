"use client";

import { Box } from "@mui/material";
import { styled, Theme, darken } from "@mui/material/styles";
import { DataGrid, GridRowsProp } from "@mui/x-data-grid";
// import { DocumentReference } from "firebase/firestore";
// import * as R from "ramda";
import { useEffect, useState, useMemo } from "react";

import {
  fetchActiveBudgets,
  fetchBudget,
  // updateDocument,
} from "./firebaseUtils";
import {
  Budget,
  // CombinedBudget,
  combineBudgets,
  columns,
  getDataRows,
} from "./utils";

const StyledDataGrid = styled(DataGrid)(({ theme }: { theme: Theme }) => ({
  "& .custom": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    "&:hover": {
      backgroundColor: darken(theme.palette.primary.main, 0.1),
    },
    "&.Mui-selected": {
      backgroundColor: theme.palette.primary.main,
      "&:hover": {
        backgroundColor: darken(theme.palette.primary.main, 0.1),
      },
    },
  },
}));

export default function Finance() {
  // const [emilyDocRef, setEmilyDocRef] = useState<DocumentReference | null>(
  //   null
  // );
  // const [brianDocRef, setBrianDocRef] = useState<DocumentReference | null>(
  //   null
  // );
  const [emilyBudget, setEmilyBudget] = useState<Budget>({});
  const [brianBudget, setBrianBudget] = useState<Budget>({});
  const [loading, setLoading] = useState<boolean>(true);

  const combinedBudget = useMemo(() => {
    // if (R.isEmpty(emilyBudget) || R.isEmpty(brianBudget)) return {};
    return combineBudgets(emilyBudget, brianBudget);
  }, [emilyBudget, brianBudget]);

  useEffect(() => {
    setLoading(true);

    fetchActiveBudgets().then(async (document) => {
      if (!document) {
        setLoading(false);
        return;
      }

      const emilyB = await fetchBudget(document.emily);
      const brianB = await fetchBudget(document.brian);
      if (!emilyB || !brianB) {
        setLoading(false);
        return;
      }

      // setEmilyDocRef(document.emily);
      // setBrianDocRef(document.brian);
      setEmilyBudget(emilyB as Budget);
      setBrianBudget(brianB as Budget);
      setLoading(false);
    });
  }, []);

  // const handleRowUpdate = async (
  //   rowId: string,
  //   updatedData: Record<string, any>,
  //   person: "emily" | "brian"
  // ) => {
  //   const docRef = person === "emily" ? emilyDocRef : brianDocRef;
  //   if (!docRef) {
  //     console.error("Document reference is not available.");
  //     return;
  //   }

  //   try {
  //     const updatedRow = {
  //       type: updatedData.section,
  //       isPreTax: updatedData.isPreTax,
  //       items: COLUMN_HEADERS.map((header) => ({
  //         name: header,
  //         amount: updatedData[header],
  //         time: getColumnTime(COLUMN_HEADERS.indexOf(header)),
  //       })),
  //     };
  //     await updateDocument(docRef, { [`rows.${rowId}`]: updatedRow });
  //     console.log(`Row ${rowId} updated successfully for ${person}.`);
  //   } catch (error) {
  //     console.error(`Failed to update row ${rowId} for ${person}:`, error);
  //   }
  // };

  const rows: GridRowsProp = getDataRows(combinedBudget);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        padding: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "90%",
        }}
      >
        <StyledDataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          rowHeight={30}
          hideFooterPagination={rows.length <= 25}
          getRowClassName={(params) => {
            if (
              ["savings", "take-home", "gross-total"].includes(
                params.id as string
              )
            )
              return "custom";
            return "";
          }}
          // processRowUpdate={(newRow, oldRow) => {
          //   return newRow;
          // }}
          showToolbar
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
}

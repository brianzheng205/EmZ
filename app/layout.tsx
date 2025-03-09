"use client";

import { useState } from "react";
import SideBar from "./SideBar";
import Header from "./Header";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import "./globals.css";

const theme = createTheme({
  palette: {
    primary: {
      main: "#904C77",
    },
    secondary: {
      main: "#E49AB0",
    },
    background: {
      default: "#ECCFC3",
      paper: "#ECBBA5",
    },
  },
  typography: {
    fontFamily: "Quicksand, Arial, sans-serif",
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#e69b7a",
          },
        },
      },
    },
  },
});

export default function RootLayout(props: { children: React.ReactNode }) {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Header
            isSideBarOpen={isSideBarOpen}
            setIsSideBarOpen={setIsSideBarOpen}
          />
          <Stack
            direction="row"
            spacing={0}
            sx={{ height: "calc(100vh - 64px)" }}
          >
            <SideBar isOpen={isSideBarOpen} />
            <Box flex={1}>{props.children}</Box>
          </Stack>
        </ThemeProvider>
      </body>
    </html>
  );
}

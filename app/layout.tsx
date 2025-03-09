"use client";

import { useState } from "react";
import SideBar from "./SideBar";
import Header from "./Header";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

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
      paper: "#ECCFC3",
    },
  },
  typography: {
    fontFamily: "Quicksand, Arial, sans-serif",
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
      <body className="flex flex-col w-full h-screen bg-background">
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Header
            isSideBarOpen={isSideBarOpen}
            setIsSideBarOpen={setIsSideBarOpen}
          />
          <div className="flex flex-grow h-[calc(100vh-64px)]">
            <SideBar isOpen={isSideBarOpen} />
            <div className="flex-grow">{props.children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

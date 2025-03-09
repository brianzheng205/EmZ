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
      light: "#757ce8",
      main: "#3f50b5",
      dark: "#002884",
      contrastText: "#fff",
    },
    secondary: {
      light: "#ff7961",
      main: "#f44336",
      dark: "#ba000d",
      contrastText: "#000",
    },
  },
  typography: {
    fontFamily: "Quicksand, Arial, sans-serif",
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);

  return (
    <html lang="en">
      <body className="flex flex-col w-full h-screen bg-background">
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
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Header
            isSideBarOpen={isSideBarOpen}
            setIsSideBarOpen={setIsSideBarOpen}
          />
          <div className="flex flex-grow h-[calc(100vh-64px)]">
            <SideBar isOpen={isSideBarOpen} />
            <div className="flex-grow">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

"use client";

import { CssBaseline, Box, Stack, Drawer } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { APIProvider } from "@vis.gl/react-google-maps";
import { ReactNode, useState } from "react";

import Header from "./Header";
import SideBar from "./SideBar";

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
    success: { main: "#9ACD32" },
    info: { main: "#F0E68C" },
  },
  typography: {
    fontFamily: "Quicksand, Arial, sans-serif",
  },
  components: {
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: "1.75rem",
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        InputLabelProps: {
          shrink: true,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: "none",
          color: "inherit",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        "input[type=number]": {
          MozAppearance: "textfield",
        },
        "input[type=number]::-webkit-outer-spin-button": {
          WebkitAppearance: "none",
          margin: 0,
        },
        "input[type=number]::-webkit-inner-spin-button": {
          WebkitAppearance: "none",
          margin: 0,
        },
      },
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: "lg",
        sx: {
          py: 4,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        variant: "contained",
      },
    },
  },
});

interface ThemeProviderWrapperProps {
  children: ReactNode;
}

export default function ThemeProviderWrapper({
  children,
}: ThemeProviderWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
      libraries={["places"]}
      solutionChannel="GMP_devsite_samples_v3_rgmautocomplete"
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Stack
          sx={{
            height: "100vh",
          }}
        >
          <Header setIsSidebarOpen={setIsSidebarOpen} />
          <Drawer open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
            <SideBar setIsSidebarOpen={setIsSidebarOpen} />
          </Drawer>
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
            }}
          >
            {children}
          </Box>
        </Stack>
      </ThemeProvider>
    </APIProvider>
  );
}

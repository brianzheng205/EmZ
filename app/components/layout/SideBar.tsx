"use client";

import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
} from "@mui/material";
import { usePathname } from "next/navigation";
import { FiHome, FiCalendar } from "react-icons/fi";
import { HiOutlineBanknotes } from "react-icons/hi2";
import { LuTv } from "react-icons/lu";
import { MdOutlineTimer } from "react-icons/md";

import { Route } from "../pages/RoutePage";
import StyledLink from "../StyledLink";

export const ROUTES_WITHOUT_HOME: Route[] = [
  {
    route: "/finance",
    label: "Finance",
    icon: <HiOutlineBanknotes />,
  },
  {
    route: "/countdown",
    label: "Countdown",
    icon: <MdOutlineTimer />,
  },
  {
    route: "/specialOccasions",
    label: "Special Occasions",
    icon: <FiCalendar />,
  },
  {
    route: "/tv",
    label: "TV",
    icon: <LuTv />,
  },
];

export const ROUTES: Route[] = [
  { route: "/", label: "Home", icon: <FiHome /> },
  ...ROUTES_WITHOUT_HOME,
];

const BORDER_RADIUS = "16px";

interface SideBarProps {
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SideBar({ setIsSidebarOpen }: SideBarProps) {
  const pathname = usePathname();

  return (
    <Stack
      sx={{
        bgcolor: "primary.main",
        color: "white",
        height: "100%",
      }}
    >
      <List sx={{ p: 2 }}>
        {ROUTES.map(({ route, label, icon }) => (
          <StyledLink key={route} href={route} passHref>
            <ListItem
              sx={{
                bgcolor: pathname === route ? "secondary.main" : "transparent",
                borderRadius: BORDER_RADIUS,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: "inherit",
              }}
              disablePadding
              onClick={() => setIsSidebarOpen(false)}
            >
              <ListItemButton sx={{ borderRadius: BORDER_RADIUS }}>
                <ListItemIcon sx={{ minWidth: 24, color: "white" }}>
                  {icon}
                </ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            </ListItem>
          </StyledLink>
        ))}
      </List>
    </Stack>
  );
}

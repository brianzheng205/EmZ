"use client";

import { usePathname } from "next/navigation";

import { FiHome, FiCalendar } from "react-icons/fi";
import { MdOutlineTimer } from "react-icons/md";
import { HiOutlineBanknotes } from "react-icons/hi2";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";

import StyledLink from "../StyledLink";
import { Route } from "../pages/RoutePage";

export const ROUTES: Route[] = [
  { route: "/", label: "Home", icon: <FiHome /> },
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
];

const BORDER_RADIUS = "16px";

export default function SideBar(props: { isOpen: boolean }) {
  const pathname = usePathname();

  return (
    <Stack
      sx={{
        bgcolor: "primary.main",
        color: "white",
        transition: "all 500ms",
        overflow: "hidden",
        minWidth: props.isOpen ? 230 : 0,
        maxWidth: props.isOpen ? 230 : 0,
        opacity: props.isOpen ? 1 : 0.3,
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

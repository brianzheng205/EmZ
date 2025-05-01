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
import { MdOutlineTimer } from "react-icons/md";

import { Route } from "../pages/RoutePage";
import StyledLink from "../StyledLink";

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

interface SideBarProps {
  isOpen: boolean;
}

export default function SideBar({ isOpen }: SideBarProps) {
  const pathname = usePathname();

  return (
    <Stack
      sx={{
        bgcolor: "primary.main",
        color: "white",
        transition: "all 500ms",
        overflow: "hidden",
        minWidth: isOpen ? 230 : 0,
        maxWidth: isOpen ? 230 : 0,
        opacity: isOpen ? 1 : 0.3,
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

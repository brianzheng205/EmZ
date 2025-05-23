"use client";

import { AppBar, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IoArrowBackOutline } from "react-icons/io5";
import { TbLayoutSidebarLeftExpand } from "react-icons/tb";

interface HeaderProps {
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Header({ setIsSidebarOpen }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Count path segments (excluding empty strings from splitting)
  const pathSegments = pathname.split("/").filter(Boolean);
  const showBackButton = pathSegments.length > 1;

  const handleBack = () => {
    // Remove the last segment to go up one level
    const parentPath = "/" + pathSegments.slice(0, -1).join("/");
    router.push(parentPath);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Stack sx={{ alignItems: "center", flexDirection: "row", flexGrow: 1 }}>
          <IconButton color="inherit" onClick={() => setIsSidebarOpen(true)}>
            <TbLayoutSidebarLeftExpand />
          </IconButton>
          {showBackButton && (
            <IconButton color="inherit" onClick={handleBack}>
              <IoArrowBackOutline />
            </IconButton>
          )}
        </Stack>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            textAlign: "center",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            EmZ
          </Link>
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

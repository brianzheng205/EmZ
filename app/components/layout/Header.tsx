import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";

import { IoArrowBackOutline } from "react-icons/io5";
import {
  TbLayoutSidebarLeftCollapseFilled,
  TbLayoutSidebarLeftExpand,
} from "react-icons/tb";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function ToggleSideBarButton(props: { isOpen: boolean; onClick: () => void }) {
  return (
    <IconButton color="inherit" onClick={props.onClick}>
      {props.isOpen ? (
        <TbLayoutSidebarLeftCollapseFilled />
      ) : (
        <TbLayoutSidebarLeftExpand />
      )}
    </IconButton>
  );
}

export default function Header(props: {
  isSideBarOpen: boolean;
  setIsSideBarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
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
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <ToggleSideBarButton
            isOpen={props.isSideBarOpen}
            onClick={() => props.setIsSideBarOpen((prev) => !prev)}
          />
          {showBackButton && (
            <IconButton color="inherit" onClick={handleBack}>
              <IoArrowBackOutline />
            </IconButton>
          )}
        </Box>
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
        <Box sx={{ flexGrow: 1 }} />
      </Toolbar>
    </AppBar>
  );
}
